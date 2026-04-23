#!/usr/bin/env node
'use strict';

require('dotenv').config({ path: process.cwd() + '/.env' });

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { resolveExecutionContext } = require('./sentry-worktree');

const ROOT_DIR = path.join(__dirname, '..', '..', '..', '..');
const LOCAL_DIR = path.join(ROOT_DIR, 'local');
const SENTRY_DIR = path.join(LOCAL_DIR, 'workspaces', 'sentry-issues');
const ISSUES_DIR = path.join(SENTRY_DIR, 'issues');
const REPORTS_DIR = path.join(SENTRY_DIR, 'daily-analysis');
const HANDOFF_BASE_DIR = path.join(LOCAL_DIR, 'workspaces', 'session-handoff');
const LATEST_JSON = path.join(SENTRY_DIR, 'latest-issues.json');
const FETCH_SCRIPT = path.join(__dirname, 'fetch-sentry-issues.js');
const SLACK_SCRIPT = path.join(__dirname, 'post-sentry-report-to-slack.js');
const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const DEFAULT_SINCE_HOURS = 24;
const STREAM_PATTERNS = [
  {
    slug: 'media-stall',
    label: 'Media Stall',
    match: (issue) => issue.title.includes('[Media Stall]'),
    ignore: ['auth', 'firebase', 'session'],
    workflow: 'shared/workflows/debugging-sentry/debugging-sentry.md',
  },
  {
    slug: 'auth',
    label: 'Auth',
    match: (issue) => /\[Auth\]|AuthError:|firebase_|api_session_/i.test(issue.title),
    ignore: ['media stall', 'video player', 'collab spinner'],
    workflow: 'shared/workflows/debugging-sentry/debugging-sentry.md',
  },
  {
    slug: 'crash',
    label: 'Crash',
    match: (issue) => issue.level === 'fatal' || /crash|TypeError|ReferenceError/i.test(issue.title),
    ignore: ['auth', 'media stall'],
    workflow: 'shared/workflows/debugging-sentry/debugging-sentry.md',
  },
];

const parseArgs = (argv) => {
  const options = {
    sinceHours: DEFAULT_SINCE_HOURS,
    skipFetch: false,
    skipSlack: false,
    skipHandoff: false,
    branch: null,
    projectDir: process.cwd(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--since-hours') {
      options.sinceHours = Number(argv[i + 1] || DEFAULT_SINCE_HOURS);
      i += 1;
      continue;
    }
    if (arg === '--skip-fetch') {
      options.skipFetch = true;
      continue;
    }
    if (arg === '--skip-slack') {
      options.skipSlack = true;
      continue;
    }
    if (arg === '--skip-handoff') {
      options.skipHandoff = true;
      continue;
    }
    if (arg === '--branch') {
      options.branch = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === '--project-dir') {
      options.projectDir = path.resolve(argv[i + 1] || process.cwd());
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/run-sentry-analysis.js [--since-hours <n>] [--branch <name>] [--project-dir <path>] [--skip-fetch] [--skip-slack] [--skip-handoff]

This command:
  1. fetches unresolved Sentry issues
  2. selects the execution repo/branch for fixes
  3. writes the daily markdown report
  4. creates a session-handoff package for child agents
  5. posts the report to Slack
  6. prints the report to stdout

If the current branch is not rd2 and you do not pass --branch, the script stops and tells you to ask the user which branch to use.`);
      process.exit(0);
    }
  }

  if (!Number.isFinite(options.sinceHours) || options.sinceHours <= 0) {
    options.sinceHours = DEFAULT_SINCE_HOURS;
  }

  return options;
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${content.trimEnd()}\n`, 'utf8');
};

const formatLocalDate = (isoString) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoString));
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const formatLocalDateTime = (isoString) => new Intl.DateTimeFormat('en-US', {
  timeZone: LOCAL_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZoneName: 'short',
}).format(new Date(isoString));

const titleCase = (value) => value
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const stripMarkdown = (value) => (value || '')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();

const sanitizeTitle = (title) => (title || '')
  .replace(/^\[[^\]]+\]\s*/g, '')
  .replace(/\s+spinner visible$/i, '')
  .replace(/\s+/g, ' ')
  .trim();

const formatCount = (count) => Number(count || 0).toLocaleString();

const issuePriority = (issue) => {
  const level = issue.level || '';
  const title = issue.title || '';
  const count = Number(issue.count || 0);
  const previousCount = count - Number(issue.count24h || 0);
  const doubled = previousCount > 0 && count >= (previousCount * 2);

  if ((level === 'fatal') || /crash/i.test(title) || ((level === 'error') && count > 20 && doubled)) {
    return 'P0';
  }
  if ((level === 'error' && count > 20) || (level === 'warning' && count > 50) || level === 'fatal') {
    return 'P1';
  }
  if ((level === 'warning' && count < 50) || (level === 'error' && count <= 20) || issue.substatus === 'new') {
    return 'P2';
  }
  return 'P3';
};

const issueTrend = (issue) => {
  if (issue.substatus === 'new') {
    return 'new';
  }
  if (issue.count24h == null) {
    return 'ongoing';
  }
  if (issue.count24h === 0) {
    return 'quiet';
  }
  if (issue.count24h <= 3) {
    return 'slow';
  }
  if (issue.count24h <= 10) {
    return 'steady';
  }
  return 'spiking';
};

const summarizeCause = (issue) => {
  const entry = issue.latestEvent?.context?.primaryLoadingEntry || issue.latestEvent?.context?.activeLoadingEntries?.[0];
  const likelyCauses = issue.latestEvent?.context?.likelyCauses || [];
  const tags = issue.latestEvent?.tags || {};

  if (issue.title.includes('[Media Stall]') && entry) {
    const parts = [
      entry.reason || entry.firstReason || 'loading',
      entry.readyStateName || null,
      entry.networkStateName || null,
      entry.loadingCount != null ? `loadingCount=${entry.loadingCount}` : null,
      issue.latestEvent?.context?.spinnerVisibleForMs != null
        ? `spinnerVisibleForMs=${issue.latestEvent.context.spinnerVisibleForMs}`
        : null,
    ].filter(Boolean);
    return parts.join(', ');
  }

  if (/\[Auth\]|AuthError:|firebase_|api_session_/i.test(issue.title)) {
    const bits = [
      tags['auth.firebaseErrorCode'] || tags['auth.error_code'] || null,
      issue.latestEvent?.userEmail ? `user=${issue.latestEvent.userEmail}` : null,
      issue.latestEvent?.context?.recoverySource ? `recovery=${issue.latestEvent.context.recoverySource}` : null,
    ].filter(Boolean);
    if (bits.length) {
      return bits.join(', ');
    }
  }

  if (likelyCauses.length) {
    return likelyCauses.slice(0, 3).join(', ');
  }

  return issue.culprit || sanitizeTitle(issue.title) || 'needs inspection';
};

const nextStepForIssue = (issue, tracked) => {
  if (tracked) {
    return `Continue investigation in ${tracked.fileBase}; validate the latest event shape before touching code.`;
  }
  if (/\[Auth\]|AuthError:|firebase_|api_session_/i.test(issue.title)) {
    return 'Start tracking under the auth stream if another event appears; otherwise monitor for one more day.';
  }
  if (issue.title.includes('[Media Stall]')) {
    return 'Inspect the latest loading context and decide whether this is a false positive or a real recovery gap.';
  }
  if (issue.level === 'fatal') {
    return 'Create a dedicated tracked issue file and route it into its own debug stream immediately.';
  }
  return 'Triage the latest event and decide whether it belongs in an existing tracked group or a new stream.';
};

const latestTimelineExcerpt = (content) => {
  const matches = [...content.matchAll(/^### \[(.+?)\] (.+)$/gm)];
  if (!matches.length) {
    return 'No prior timeline entry.';
  }

  const last = matches[matches.length - 1];
  const start = last.index || 0;
  const nextMatch = content.slice(start + last[0].length).match(/\n### \[/);
  const end = nextMatch ? start + last[0].length + nextMatch.index : content.length;
  const section = content.slice(start, end).trim();
  const lines = section.split('\n')
    .slice(0, 4)
    .map((line) => stripMarkdown(line.replace(/^### \[[^\]]+\]\s*/, '')))
    .filter(Boolean);
  return lines.join(' ');
};

const parseTrackerFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const baseName = path.basename(filePath);
  const titleMatch = content.match(/^#\s+(?:Group:\s+)?(.+)$/m);
  const membersMatch = content.match(/- \*\*Members\*\*: (.+)$/m);
  const members = membersMatch
    ? membersMatch[1].split(',').map((member) => member.trim()).filter(Boolean)
    : [];
  const trackingStarted = (content.match(/- \*\*Tracking Started\*\*: ([^\n]+)/) || [])[1] || null;
  const status = (content.match(/- \*\*Status\*\*: ([^\n]+)/) || [])[1] || null;
  const fixAttempts = [...content.matchAll(/^### \[[^\]]+\] Fix Attempt/gm)].length;

  return {
    filePath,
    fileBase: baseName,
    title: titleMatch ? stripMarkdown(titleMatch[1]) : baseName.replace(/\.md$/, ''),
    isGroup: baseName.startsWith('group-') || /^#\s+Group:/m.test(content),
    members,
    trackingStarted,
    status,
    fixAttempts,
    latestExcerpt: latestTimelineExcerpt(content),
  };
};

const inferStreamPattern = (issue) => STREAM_PATTERNS.find((pattern) => pattern.match(issue)) || null;

const loadTrackers = () => {
  ensureDir(ISSUES_DIR);
  const files = fs.readdirSync(ISSUES_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();
  const trackers = files.map((file) => parseTrackerFile(path.join(ISSUES_DIR, file)));
  const issueToTracker = new Map();

  trackers.forEach((tracker) => {
    tracker.members.forEach((member) => issueToTracker.set(member, tracker));
    if (!tracker.members.length) {
      const match = tracker.title.match(/\b[A-Z]+-[A-Z]+-[A-Z0-9]+\b/);
      if (match) {
        issueToTracker.set(match[0], tracker);
      }
    }
  });

  return { trackers, issueToTracker };
};

const buildIssueContext = (rawIssue, issueToTracker) => {
  const tracker = issueToTracker.get(rawIssue.shortId) || null;
  const inferredStream = inferStreamPattern(rawIssue);
  const streamSlug = tracker?.isGroup
    ? tracker.fileBase.replace(/\.md$/, '').replace(/^group-/, '')
    : (inferredStream ? inferredStream.slug : 'other');

  return {
    ...rawIssue,
    cleanTitle: sanitizeTitle(rawIssue.title),
    tracker,
    priorityLabel: issuePriority(rawIssue),
    trendLabel: issueTrend(rawIssue),
    streamSlug,
    streamLabel: tracker?.title || inferredStream?.label || titleCase(streamSlug),
    causeSummary: summarizeCause(rawIssue),
    nextStep: nextStepForIssue(rawIssue, tracker),
  };
};

const buildGroupedStreams = (issues) => {
  const streams = new Map();

  issues.forEach((issue) => {
    const key = issue.tracker?.fileBase || issue.streamSlug;
    if (!streams.has(key)) {
      streams.set(key, {
        key,
        slug: issue.streamSlug,
        label: issue.streamLabel,
        tracker: issue.tracker,
        issues: [],
      });
    }
    streams.get(key).issues.push(issue);
  });

  return [...streams.values()]
    .map((stream) => ({
      ...stream,
      issues: stream.issues.sort((a, b) => Number(b.count || 0) - Number(a.count || 0)),
    }))
    .sort((a, b) => {
      const aTracked = a.tracker ? 0 : 1;
      const bTracked = b.tracker ? 0 : 1;
      if (aTracked !== bTracked) {
        return aTracked - bTracked;
      }
      const aCount = a.issues.reduce((sum, issue) => sum + Number(issue.count || 0), 0);
      const bCount = b.issues.reduce((sum, issue) => sum + Number(issue.count || 0), 0);
      return bCount - aCount;
    });
};

const formatIssueRow = (issue) => `| ${issue.shortId} | ${issue.cleanTitle} | ${issue.environment || 'unknown'} | ${formatCount(issue.count)} | ${issue.trendLabel} | ${issue.priorityLabel} | ${issue.tracker ? 'yes' : 'no'} | no |`;

const buildReport = ({ issues, streams, fetchedAt, executionContext, sinceHours }) => {
  const date = formatLocalDate(fetchedAt);
  const localRunTime = formatLocalDateTime(fetchedAt);
  const trackedIssues = issues.filter((issue) => !!issue.tracker);
  const newIssues = issues.filter((issue) => !issue.tracker);
  const exactFixes = [];
  const keySignals = [];

  const summaryLines = [
    `- Tracked issues: ${streams.filter((stream) => !!stream.tracker).length} stream${streams.filter((stream) => !!stream.tracker).length === 1 ? '' : 's'}`,
    `- Issues in ${sinceHours}h window: ${issues.length}`,
    `- New/untracked: ${newIssues.length}`,
    `- Issues with exact fix ready: ${exactFixes.length}`,
    `- Fix branch: ${executionContext.targetBranch}`,
    `- Fix location: ${executionContext.executionDir}`,
  ];

  const trackedSections = streams
    .filter((stream) => !!stream.tracker)
    .map((stream) => {
      const totalCount = stream.issues.reduce((sum, issue) => sum + Number(issue.count || 0), 0);
      const header = stream.tracker.isGroup
        ? `### [GROUP: ${stream.tracker.title}] — Total: ${formatCount(totalCount)} events`
        : `### [${stream.issues[0].shortId}] ${stream.issues[0].cleanTitle}`;

      const block = [
        header,
        `> Latest from tracking file: ${stream.tracker.latestExcerpt}`,
        '',
      ];

      if (stream.issues.length > 1 || stream.tracker.isGroup) {
        block.push('| Member | Title | Count | Trend |');
        block.push('|--------|-------|-------|-------|');
        stream.issues.forEach((issue) => {
          block.push(`| ${issue.shortId} | ${issue.cleanTitle} | ${formatCount(issue.count)} | ${issue.trendLabel} |`);
        });
        block.push('');
      }

      const topIssue = stream.issues[0];
      const updateLine = `**Today's update:** ${topIssue.shortId} is ${topIssue.trendLabel}; latest signal looks like ${topIssue.causeSummary}.`;
      block.push(updateLine);
      keySignals.push(`**${stream.label}:** ${topIssue.shortId} is the lead signal. ${topIssue.causeSummary}.`);
      return block.join('\n');
    })
    .join('\n\n---\n\n');

  const newIssueSections = newIssues
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .map((issue) => [
      `### [${issue.shortId}] ${issue.cleanTitle} — Env: ${issue.environment || 'unknown'} — Count: ${formatCount(issue.count)} · ${issue.priorityLabel}`,
      `**What's happening**: ${issue.causeSummary}.`,
      `**Likely cause**: ${issue.latestEvent?.context?.likelyCauses?.slice(0, 3).join(', ') || 'Needs event inspection.'}`,
      `**Suggested next step**: ${issue.nextStep}`,
    ].join('\n'))
    .join('\n\n');

  if (newIssues[0]) {
    keySignals.push(`**New issues:** ${newIssues[0].shortId} is the newest untracked item. ${newIssues[0].nextStep}`);
  }

  const recurringSection = trackedIssues.length
    ? [
      '| Short ID | Title | Fix Attempted | Before | After | Status |',
      '|----------|-------|---------------|--------|-------|--------|',
      ...streams
        .filter((stream) => !!stream.tracker)
        .flatMap((stream) => stream.issues.map((issue) => {
          const before = issue.count24h != null ? Math.max(0, issue.count - issue.count24h) : 'n/a';
          const attempted = stream.tracker.fixAttempts ? `${stream.tracker.fixAttempts} prior attempts` : 'none logged';
          return `| ${issue.shortId} | ${issue.cleanTitle} | ${attempted} | ${before} | ${formatCount(issue.count)} | ${issue.trendLabel} |`;
        })),
    ].join('\n')
    : 'No tracked issues in this window.';

  const report = [
    `# Sentry Daily Analysis — ${date}`,
    '',
    `Local run time: ${localRunTime}`,
    `Fetched at (UTC): ${fetchedAt}`,
    `Time zone: ${LOCAL_TIME_ZONE}`,
    `Fix branch: ${executionContext.targetBranch}`,
    `Fix repository: ${executionContext.executionDir}`,
    `Fix execution mode: ${executionContext.usesWorktree ? `dedicated worktree (${executionContext.worktreeStatus})` : 'current repository'}`,
    '',
    '## Summary',
    ...summaryLines,
    '',
    '---',
    '',
    '## 1. Tracked Issues',
    trackedSections || 'No tracked issues were active in this fetch window.',
    '',
    '---',
    '',
    '## 2. New / Untracked Issues',
    newIssueSections || 'No new/untracked issues in this fetch window.',
    '',
    '---',
    '',
    '## 3. Issues with an Exact Fix Ready',
    exactFixes.length ? exactFixes.join('\n\n') : 'None confirmed this session.',
    '',
    '---',
    '',
    '## Recurring Issues — Progress Report',
    recurringSection,
    '',
    '---',
    '',
    '## All Issues (brief table)',
    '',
    '| Short ID | Title | Env | Count | Trend | Priority | Tracked | Exact Fix |',
    '|----------|-------|-----|-------|-------|----------|---------|-----------|',
    ...issues.map(formatIssueRow),
    '',
    '---',
    '',
    '## Key Signal for Next Fix',
    '',
    keySignals.length ? keySignals.join('\n\n') : 'No dominant signal in this window.',
  ].join('\n');

  return { date, content: report, localRunTime };
};

const buildLaunchPrompt = (stream, reportPath, handoffDir, executionContext) => {
  const lines = [
    'Do code changes from this repo path:',
    executionContext.executionDir,
    '',
    `Use branch \`${executionContext.targetBranch}\`.`,
    '',
    'User approval for this Sentry fix flow:',
    executionContext.usesWorktree
      ? '- You may inspect files, edit code, run non-destructive git commands, run targeted validation, create a feature branch if needed, commit, push, and open a PR from this worktree without asking again.'
      : '- Normal approval rules still apply before committing or pushing from the current repo.',
    '- Do not merge anything yourself.',
    '- Do not push directly to protected branches.',
    '- Do not work outside this repo path unless the user explicitly asks.',
    '',
    `Read this handoff file completely before doing anything else:`,
    path.join(handoffDir, `${stream.slug}.md`).replace(`${ROOT_DIR}/`, ''),
    '',
    'Then read:',
  ];

  if (stream.tracker?.filePath) {
    lines.push(stream.tracker.filePath.replace(`${ROOT_DIR}/`, ''));
  }
  lines.push(reportPath.replace(`${ROOT_DIR}/`, ''));
  lines.push('');
  lines.push(`Use ${stream.workflowPath.replace(`${ROOT_DIR}/`, '')} next if you need the full workflow context.`);
  lines.push(`Ignore ${stream.ignore.join(', ') || 'unrelated streams'}.`);
  return lines.join('\n');
};

const buildStreamFiles = ({ reportPath, reportDate, streams, executionContext }) => {
  if (!streams.length) {
    return null;
  }

  ensureDir(HANDOFF_BASE_DIR);
  const folderName = `${reportDate}-sentry`;
  const handoffDir = path.join(HANDOFF_BASE_DIR, folderName);
  ensureDir(handoffDir);

  const sharedSources = [
    LATEST_JSON,
    reportPath,
    ...streams.map((stream) => stream.tracker?.filePath).filter(Boolean),
  ];

  const readme = [
    `# Session Handoff: Sentry Bug Triage — ${reportDate}`,
    '',
    '## Why This Was Split',
    '',
    `${streams.length} independent bug stream${streams.length === 1 ? '' : 's'} are active in the latest Sentry window, and each one needs a different investigation path or fix strategy.`,
    '',
    '## Fix Execution Context',
    '',
    `- Branch for fixes: \`${executionContext.targetBranch}\``,
    `- Repo path for fixes: \`${executionContext.executionDir}\``,
    `- Mode: ${executionContext.usesWorktree ? `dedicated worktree (${executionContext.worktreeStatus})` : 'current repository'}`,
    `- Current branch at analysis start: \`${executionContext.currentBranch}\``,
    `- Approval envelope: ${executionContext.usesWorktree
      ? 'pre-approved through PR creation inside this dedicated worktree'
      : 'normal project approval rules still apply before commit/push'}`,
    '',
    '## Streams',
    '',
    ...streams.map((stream) => `- **${stream.slug}**: ${stream.summary}`),
    '',
    '## Shared Source of Truth',
    '',
    ...sharedSources.map((source) => `- \`${source}\``),
    '',
    '## How To Use This',
    '',
    '- Parent chat stays open for broad discussion, re-fetching Sentry, and posting reports.',
    '- Open one new AI chat tab per stream.',
    '- Paste the matching prompt from `launch-prompts.md` into each new tab.',
    '- Each child session reads only its handoff file first and ignores the other streams.',
    '- This package is tool agnostic; if your current tool cannot open tabs automatically, open them manually.',
  ].join('\n');
  writeFile(path.join(handoffDir, 'README.md'), readme);

  const promptBlocks = [`# Launch Prompts — ${reportDate} Sentry Handoff`, '', 'Open one new AI chat tab per stream, paste the matching prompt below.', '', '---', ''];

  streams.forEach((stream) => {
    const lines = [
      `# ${stream.label} — Handoff ${reportDate}`,
      '',
      '## Scope',
      stream.summary,
      '',
      '## Code Changes',
      `- Work from: \`${executionContext.executionDir}\``,
      `- Branch: \`${executionContext.targetBranch}\``,
      `- Mode: ${executionContext.usesWorktree ? `dedicated worktree (${executionContext.worktreeStatus})` : 'current repository'}`,
      `- Approval: ${executionContext.usesWorktree
        ? 'You may inspect, edit, validate, branch, commit, push, and open a PR from this worktree without asking again.'
        : 'Do not commit or push until the user approves.'}`,
      '- Never merge or push directly to a protected branch.',
      '',
      '## Do Not Touch',
      ...stream.ignore.map((item) => `- ${item}`),
      '',
      '## Read First',
      `1. \`${reportPath}\``,
      ...(stream.tracker?.filePath ? [`2. \`${stream.tracker.filePath}\``] : []),
      '',
      '## Current State',
      '',
      '| Issue | Count | Priority | Trend |',
      '|-------|-------|----------|-------|',
      ...stream.issues.map((issue) => `| ${issue.shortId} | ${formatCount(issue.count)} | ${issue.priorityLabel} | ${issue.trendLabel} |`),
      '',
      '## Open Questions',
      ...stream.questions.map((question, index) => `${index + 1}. ${question}`),
      '',
      '## Recommended First 3 Actions',
      ...stream.actions.map((action, index) => `${index + 1}. ${action}`),
      '',
      '## Completion Criteria',
      ...stream.completionCriteria.map((item) => `- ${item}`),
    ].join('\n');
    writeFile(path.join(handoffDir, `${stream.slug}.md`), lines);

    promptBlocks.push(`## ${stream.label} Stream`);
    promptBlocks.push('');
    promptBlocks.push('```');
    promptBlocks.push(buildLaunchPrompt(stream, reportPath, handoffDir, executionContext));
    promptBlocks.push('```');
    promptBlocks.push('');
    promptBlocks.push('---');
    promptBlocks.push('');
  });

  writeFile(path.join(handoffDir, 'launch-prompts.md'), promptBlocks.join('\n'));

  return handoffDir;
};

const buildHandoffStreams = (streams) => {
  const trackedStreams = streams.filter((stream) => !!stream.tracker);
  const fallbackStreams = streams.filter((stream) => !stream.tracker);
  const selected = [...trackedStreams, ...fallbackStreams].slice(0, 5);

  return selected.map((stream) => {
    const pattern = STREAM_PATTERNS.find((candidate) => candidate.slug === stream.slug);
    const leadIssue = stream.issues[0];
    return {
      ...stream,
      workflowPath: path.join(ROOT_DIR, pattern?.workflow || 'shared/workflows/debugging-sentry/debugging-sentry.md'),
      ignore: pattern?.ignore || ['all other streams'],
      summary: stream.tracker
        ? `${stream.label} issues from ${stream.tracker.fileBase}; lead signal is ${leadIssue.shortId} (${leadIssue.priorityLabel}, ${leadIssue.trendLabel}).`
        : `New ${stream.label.toLowerCase()} issues that are not yet tracked; lead signal is ${leadIssue.shortId}.`,
      questions: [
        `Does ${leadIssue.shortId} still match the same event shape in the freshest event data?`,
        `Is this stream mostly false positives, a real user-facing bug, or a mix of both?`,
        `What is the smallest next code or tracking change that would reduce uncertainty today?`,
      ],
      actions: [
        `Read the latest report and fresh event data for ${leadIssue.shortId}.`,
        stream.tracker
          ? `Use ${stream.tracker.fileBase} as the history source before proposing a change.`
          : `Decide whether ${leadIssue.shortId} belongs in an existing tracked file or needs a new one.`,
        `Come back with one recommended fix or one concrete next investigation step.`,
      ],
      completionCriteria: [
        'The lead issue has a clear diagnosis or a bounded next experiment.',
        'A child session can work this stream without rereading the full parent thread.',
        'Any follow-up change stays inside the stream boundary and avoids unrelated files.',
      ],
    };
  });
};

const runNodeScript = (scriptPath, args, cwd = ROOT_DIR) => {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
};

const postToSlack = (reportPath) => {
  try {
    const output = runNodeScript(SLACK_SCRIPT, ['--file', reportPath]);
    return { ok: true, output: output.trim() };
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    return { ok: false, output: stderr };
  }
};

const run = () => {
  const options = parseArgs(process.argv.slice(2));
  ensureDir(SENTRY_DIR);
  ensureDir(REPORTS_DIR);
  const executionContext = resolveExecutionContext({
    projectDir: options.projectDir,
    targetBranch: options.branch,
  });

  if (executionContext.needsBranchSelection) {
    throw new Error(executionContext.prompt);
  }

  if (!options.skipFetch) {
    console.log(`Fetching Sentry issues from the last ${options.sinceHours} hours across all environments...`);
    console.log(`Fixes will run from ${executionContext.executionDir} on branch ${executionContext.targetBranch}.`);
    const fetchOutput = runNodeScript(
      FETCH_SCRIPT,
      ['--since-hours', String(options.sinceHours), '--include-seen'],
      executionContext.executionDir
    );
    if (fetchOutput.trim()) {
      console.log(fetchOutput.trim());
    }
  }

  if (!fs.existsSync(LATEST_JSON)) {
    throw new Error(`Missing latest Sentry payload: ${LATEST_JSON}`);
  }

  const latest = readJson(LATEST_JSON);
  const { issueToTracker } = loadTrackers();
  const issues = (latest.issues || [])
    .map((issue) => buildIssueContext(issue, issueToTracker))
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0));
  const streams = buildGroupedStreams(issues);
  const report = buildReport({
    issues,
    streams,
    fetchedAt: latest.fetchedAt,
    executionContext,
    sinceHours: options.sinceHours,
  });
  const reportPath = path.join(REPORTS_DIR, `${report.date}.md`);

  writeFile(reportPath, report.content);

  const handoffStreams = buildHandoffStreams(streams);
  const handoffDir = options.skipHandoff ? null : buildStreamFiles({
    reportPath,
    reportDate: report.date,
    streams: handoffStreams,
    executionContext,
  });

  const slackResult = options.skipSlack ? { ok: false, output: 'Slack skipped by flag.' } : postToSlack(reportPath);

  console.log('');
  console.log(`=== Sentry Daily Analysis — ${report.date} ===`);
  console.log(`Total issues analyzed: ${issues.length} (all environments)`);
  console.log(`Fix branch: ${executionContext.targetBranch}`);
  console.log(`Fix repo: ${executionContext.executionDir}`);
  console.log(`Daily report: ${reportPath}`);
  if (handoffDir) {
    console.log(`Session handoff package: ${handoffDir}`);
  }
  if (!options.skipSlack) {
    console.log(slackResult.ok ? 'Report posted to Slack ✅' : `Slack post failed: ${slackResult.output}`);
  }
  console.log('');
  console.log(report.content);
};

run();
