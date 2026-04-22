#!/usr/bin/env node
// scripts/fetch-sentry-issues.js
require('dotenv').config({ path: process.cwd() + '/.env' });

const fs = require('fs');
const path = require('path');

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG_SLUG = process.env.SENTRY_ORG_SLUG;
const SENTRY_PROJECT_SLUG = process.env.SENTRY_PROJECT_SLUG;

const REPORTS_DIR = path.join(__dirname, '..', '..', '..', '..', 'local', 'workspaces', 'sentry-issues');
const STATE_FILE = path.join(REPORTS_DIR, 'fetch-state.json');
const LATEST_REPORT_FILE = path.join(REPORTS_DIR, 'latest-issues.json');
const DEFAULT_SINCE_HOURS = 24;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 10;

if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG_SLUG || !SENTRY_PROJECT_SLUG) {
  console.error('Error: Missing Sentry credentials in .env file.');
  console.error('Please ensure SENTRY_AUTH_TOKEN, SENTRY_ORG_SLUG, and SENTRY_PROJECT_SLUG are set.');
  process.exit(1);
}

const parseArgs = (argv) => {
  const options = {
    sinceHours: DEFAULT_SINCE_HOURS,
    sinceHoursExplicit: false,
    includeSeen: false,
    resetState: false,
    environment: null,
    domain: null,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--include-seen') {
      options.includeSeen = true;
      continue;
    }
    if (arg === '--reset-state') {
      options.resetState = true;
      continue;
    }
    if (arg === '--since-hours') {
      options.sinceHours = Number(argv[i + 1] || DEFAULT_SINCE_HOURS);
      options.sinceHoursExplicit = true;
      i += 1;
      continue;
    }
    if (arg === '--environment') {
      options.environment = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === '--domain') {
      options.domain = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === '--page-size') {
      options.pageSize = Number(argv[i + 1] || DEFAULT_PAGE_SIZE);
      i += 1;
      continue;
    }
    if (arg === '--max-pages') {
      options.maxPages = Number(argv[i + 1] || DEFAULT_MAX_PAGES);
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/fetch-sentry-issues.js [environment]
  node scripts/fetch-sentry-issues.js --environment rd --domain rd2.app.roll.ai
  node scripts/fetch-sentry-issues.js --include-seen
  node scripts/fetch-sentry-issues.js --reset-state

Options:
  --since-hours <n>   Look back window in hours (default: since last fetch, or ${DEFAULT_SINCE_HOURS}h if no prior fetch)
  --environment <env> Local filter against latest event environment
  --domain <host>     Local filter against latest event/request hostname
  --include-seen      Include issues already returned by previous runs
  --reset-state       Clear local dedupe state before fetching
  --page-size <n>     Page size for Sentry issue list pagination
  --max-pages <n>     Max pages to request from Sentry`);
      process.exit(0);
    }

    // Backward-compatible positional environment filter: `node ... rd`
    if (!arg.startsWith('-') && !options.environment) {
      options.environment = arg;
    }
  }

  if (!Number.isFinite(options.sinceHours) || options.sinceHours <= 0) {
    options.sinceHours = DEFAULT_SINCE_HOURS;
  }
  if (!Number.isFinite(options.pageSize) || options.pageSize <= 0) {
    options.pageSize = DEFAULT_PAGE_SIZE;
  }
  if (!Number.isFinite(options.maxPages) || options.maxPages <= 0) {
    options.maxPages = DEFAULT_MAX_PAGES;
  }

  return options;
};

const ensureReportsDir = () => {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
};

const loadState = () => {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (_) {
    return {
      version: 1,
      lastFetchedAt: null,
      seenIssues: {},
      issueCounts: {},
    };
  }
};

const saveState = (state) => {
  ensureReportsDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
};

const resetState = () => {
  ensureReportsDir();
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }
};

const sentryRequest = async (pathname, searchParams = {}) => {
  const url = new URL(`https://sentry.io${pathname}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sentry API Error: ${response.status} ${response.statusText} - ${text}`);
  }

  return {
    body: await response.json(),
    headers: response.headers,
  };
};

const toTimestamp = (value) => {
  const ts = value ? Date.parse(value) : NaN;
  return Number.isFinite(ts) ? ts : null;
};

const issueSeenInWindow = (issue, sinceTs) => {
  const firstSeenTs = toTimestamp(issue.firstSeen);
  const lastSeenTs = toTimestamp(issue.lastSeen);
  return (firstSeenTs !== null && firstSeenTs >= sinceTs) ||
    (lastSeenTs !== null && lastSeenTs >= sinceTs);
};

const extractNextCursor = (linkHeader) => {
  if (!linkHeader) {
    return null;
  }
  const nextMatch = linkHeader.match(/rel="next";\s*results="true";\s*cursor="([^"]+)"/);
  if (nextMatch) {
    return nextMatch[1];
  }
  const fallbackMatch = linkHeader.match(/cursor="([^"]+)"/);
  return fallbackMatch ? fallbackMatch[1] : null;
};

const fetchIssues = async ({ sinceTs, pageSize, maxPages }) => {
  const issues = [];
  let cursor = null;

  for (let page = 0; page < maxPages; page += 1) {
    const { body, headers } = await sentryRequest(
      `/api/0/projects/${SENTRY_ORG_SLUG}/${SENTRY_PROJECT_SLUG}/issues/`,
      {
        query: 'is:unresolved',
        sort: 'date',
        limit: pageSize,
        cursor,
      }
    );

    if (!Array.isArray(body) || body.length === 0) {
      break;
    }

    issues.push(...body);

    const pageContainsWindowMatches = body.some((issue) => issueSeenInWindow(issue, sinceTs));
    if (!pageContainsWindowMatches) {
      break;
    }

    const nextCursor = extractNextCursor(headers.get('link'));
    if (!nextCursor) {
      break;
    }
    cursor = nextCursor;
  }

  return [...new Map(issues.map((issue) => [issue.id, issue])).values()];
};

const extractTagMap = (tags = []) => {
  return tags.reduce((acc, tag) => {
    if (tag?.key) {
      acc[tag.key] = tag.value;
    }
    return acc;
  }, {});
};

const findRequestUrl = (event, tagMap) => {
  const requestEntry = Array.isArray(event?.entries)
    ? event.entries.find((entry) => entry.type === 'request')
    : null;
  return requestEntry?.data?.url || tagMap.url || null;
};

const normalizeDomain = (value) => {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).hostname;
  } catch (_) {
    return String(value).replace(/^https?:\/\//, '').split('/')[0] || null;
  }
};

const fetchLatestEventSummary = async (issueId) => {
  try {
    const { body } = await sentryRequest(`/api/0/issues/${issueId}/events/latest/`);
    const tagMap = extractTagMap(body?.tags);
    const requestUrl = findRequestUrl(body, tagMap);
    return {
      eventId: body?.eventID || body?.id || null,
      dateCreated: body?.dateCreated || null,
      environment: tagMap.environment || null,
      url: requestUrl,
      domain: normalizeDomain(requestUrl),
      release: body?.release || null,
      transaction: tagMap.transaction || null,
      userEmail: body?.user?.email || null,
      userId: body?.user?.id || null,
      tags: tagMap,
      context: body?.context || null,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

const enrichIssues = async (issues) => {
  return Promise.all(issues.map(async (issue) => {
    const latestEvent = await fetchLatestEventSummary(issue.id);
    return {
      id: issue.id,
      shortId: issue.shortId,
      title: issue.title,
      culprit: issue.culprit,
      level: issue.level,
      priority: issue.priority || issue.metadata?.initial_priority || null,
      count: Number(issue.count || 0),
      userCount: Number(issue.userCount || 0),
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
      status: issue.status,
      substatus: issue.substatus || null,
      environment: latestEvent.environment || null,
      domain: latestEvent.domain || null,
      latestEvent,
      metadata: issue.metadata,
    };
  }));
};

const matchesLocalFilters = (issue, filters) => {
  const environmentFilter = filters.environment?.trim().toLowerCase();
  const domainFilter = filters.domain?.trim().toLowerCase();

  if (environmentFilter && (issue.environment || '').toLowerCase() !== environmentFilter) {
    return false;
  }
  if (domainFilter && (issue.domain || '').toLowerCase() !== domainFilter) {
    return false;
  }
  return true;
};

const cleanIssueForState = (issue, fetchedAt) => ({
  shortId: issue.shortId,
  title: issue.title,
  environment: issue.environment,
  domain: issue.domain,
  firstFetchedAt: fetchedAt,
  lastSeenAtFetch: issue.lastSeen,
});

const createSnapshotFileName = (fetchedAt) => {
  return path.join(REPORTS_DIR, `issues-${fetchedAt.replace(/[:.]/g, '-').replace(/Z$/, 'Z')}.json`);
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.resetState) {
    resetState();
  }

  const fetchedAt = new Date().toISOString();
  const state = loadState();

  const lastFetchTs = state.lastFetchedAt ? Date.parse(state.lastFetchedAt) : NaN;
  const sinceTs = (!options.sinceHoursExplicit && Number.isFinite(lastFetchTs))
    ? lastFetchTs
    : Date.now() - (options.sinceHours * 60 * 60 * 1000);
  const sinceIso = new Date(sinceTs).toISOString();
  const sinceSource = (!options.sinceHoursExplicit && Number.isFinite(lastFetchTs)) ? 'last fetch' : `--since-hours ${options.sinceHours}`;

  console.log(`Fetching unresolved Sentry issues since ${sinceIso} (${sinceSource})...`);

  const unresolvedIssues = await fetchIssues({
    sinceTs,
    pageSize: options.pageSize,
    maxPages: options.maxPages,
  });

  const issuesInWindow = unresolvedIssues.filter((issue) => issueSeenInWindow(issue, sinceTs));
  const enrichedIssues = await enrichIssues(issuesInWindow);
  const filteredIssues = enrichedIssues.filter((issue) => matchesLocalFilters(issue, options));

  const alreadySeenIssues = filteredIssues.filter((issue) => !!state.seenIssues?.[issue.id]);
  const newIssues = options.includeSeen
    ? filteredIssues
    : filteredIssues.filter((issue) => !state.seenIssues?.[issue.id]);

  // Compute 24h delta: how many new events since the last fetch
  const prevCounts = state.issueCounts || {};
  filteredIssues.forEach((issue) => {
    const prev = prevCounts[issue.id];
    issue.count24h = (prev != null) ? Math.max(0, issue.count - prev) : null;
  });

  const nextState = {
    version: 1,
    lastFetchedAt: fetchedAt,
    seenIssues: {
      ...(state.seenIssues || {}),
    },
    issueCounts: {
      ...(prevCounts),
    },
  };

  filteredIssues.forEach((issue) => {
    nextState.seenIssues[issue.id] = cleanIssueForState(issue, fetchedAt);
    nextState.issueCounts[issue.id] = issue.count;
  });

  ensureReportsDir();
  saveState(nextState);

  const reportPayload = {
    status: 'success',
    fetchedAt,
    since: sinceIso,
    filters: {
      environment: options.environment || null,
      domain: options.domain || null,
      includeSeen: options.includeSeen,
    },
    state: {
      file: STATE_FILE,
      previousLastFetchedAt: state.lastFetchedAt || null,
      lastFetchedAt: nextState.lastFetchedAt,
    },
    summary: {
      unresolvedIssuesFetched: unresolvedIssues.length,
      issuesInWindow: enrichedIssues.length,
      issuesAfterLocalFilters: filteredIssues.length,
      newIssuesReturned: newIssues.length,
      alreadyFetchedSuppressed: options.includeSeen ? 0 : alreadySeenIssues.length,
    },
    issues: newIssues,
    alreadyFetchedIssues: options.includeSeen ? [] : alreadySeenIssues.map((issue) => ({
      id: issue.id,
      shortId: issue.shortId,
      title: issue.title,
      environment: issue.environment,
      domain: issue.domain,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
    })),
  };

  const snapshotFile = createSnapshotFileName(fetchedAt);
  fs.writeFileSync(LATEST_REPORT_FILE, JSON.stringify(reportPayload, null, 2) + '\n', 'utf8');
  fs.writeFileSync(snapshotFile, JSON.stringify(reportPayload, null, 2) + '\n', 'utf8');

  console.log(JSON.stringify({
    ...reportPayload,
    reportFiles: {
      latest: LATEST_REPORT_FILE,
      snapshot: snapshotFile,
    },
  }, null, 2));
};

run().catch((error) => {
  console.error('Failed to fetch Sentry issues:', error.message);
  process.exit(1);
});
