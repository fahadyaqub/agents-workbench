#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ──────────────────────────────────────────────────────────────────

const LOCAL_DIR = path.join(__dirname, '..', '..', '..', '..', 'local');
const ENV_FILE = path.join(LOCAL_DIR, '.env');
const REPORTS_DIR = path.join(LOCAL_DIR, 'workspaces', 'sentry-issues', 'daily-analysis');
const LATEST_JSON = path.join(LOCAL_DIR, 'workspaces', 'sentry-issues', 'latest-issues.json');

if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
if (!WEBHOOK_URL) {
  console.error('⚠️  Slack not configured — SLACK_WEBHOOK_URL missing from local/.env');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const firstName = (email) => {
  if (!email) return null;
  const local = email.split('@')[0].split('+')[0];
  const name = local.split(/[._-]/)[0].replace(/[0-9]/g, '');
  return name ? name[0].toUpperCase() + name.slice(1) : null;
};

const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const humanizeTitle = (title) => {
  const map = [
    [/collab_edit_container.*video_loading/, 'Video stuck in the editor'],
    [/video_player_review.*video_loading/,   'Video stuck on the review page'],
    [/collab_edit_container.*audio_loading/, 'Audio stuck in the editor'],
    [/video_player_live.*video_loading/,     'Video stuck during live playback'],
    [/video_player_review.*audio_loading/,   'Audio stuck on the review page'],
    [/api_session_check_failed/,             'User session expired unexpectedly'],
    [/firebase_session_bootstrap_incomplete/,'Sign-in session incomplete on load'],
    [/firebase_auto_login_failed_retrying/,  'Auto sign-in failed (retrying)'],
    [/firebase_auto_login_failed_no_stored/, 'No saved sign-in token found'],
    [/firebase_explicit_login_failed/,       'Sign-in attempt failed'],
    [/firebase_persistence_no_session/,      'Saved session not found — user logged out'],
    [/firebase_login_timeout/,              'Sign-in timed out (took too long)'],
    [/auto_login_skipped/,                  'Auto sign-in was skipped'],
    [/smoothScrollTo/,                       'Scroll animation crash'],
    [/shouldAutoSplit/,                      'Auto-split feature crash'],
  ];
  for (const [re, label] of map) if (re.test(title)) return label;
  return title
    .replace(/\[.*?\]\s*/g, '')
    .replace(/AuthError:\w+:\s*/g, '')
    .replace(/collab_edit_container/g, 'editor')
    .replace(/video_player_review/g, 'review page')
    .replace(/ — .*$/, '')
    .trim()
    .slice(0, 60);
};

const statusFor = (issue, tracked, exactFix, trend) => {
  if (exactFix)                                           return ['🟢', 'Exact fix available'];
  if (issue.substatus === 'new')                          return ['🔵', 'New — needs investigation'];
  if (issue.level === 'fatal')                            return ['🔴', 'Critical'];
  if (issue.level === 'error' && issue.count > 50)        return ['🔴', 'Needs urgent attention'];
  if (issue.level === 'error' && issue.count > 5)         return ['🟠', 'Needs attention'];
  if (!tracked && issue.count > 10)                       return ['🟠', 'Needs investigation'];
  if (trend === '↓' || trend === 'rate slowing')          return ['🟢', 'Improving'];
  if (trend === '↑' && issue.count > 100)                 return ['🟠', 'Regressing — needs attention'];
  return ['🟡', 'Being monitored'];
};

// ─── Category definitions ────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'media', emoji: '🎥',
    label: 'Video Loading Issues',
    subtitle: 'Videos or audio getting stuck while playing',
    match: (i) => i.title.includes('[Media Stall]'),
  },
  {
    id: 'auth', emoji: '🔐',
    label: 'Sign-in & Session Issues',
    subtitle: 'Users getting logged out or unable to sign in',
    match: (i) => /\[Auth\]|AuthError:|firebase_|api_session_/.test(i.title),
  },
  {
    id: 'crash', emoji: '💥',
    label: 'Crashes',
    subtitle: 'App crashes or fatal errors',
    match: (i) => i.level === 'fatal' || /crash|TypeError|ReferenceError/.test(i.title),
  },
];

// ─── Parsers ─────────────────────────────────────────────────────────────────

const parseAllIssuesTable = (content) => {
  // Returns { [shortId]: { tracked, exactFix, trend } }
  const match = content.match(/## All Issues[^\n]*\n\n([\s\S]*?)(?=\n---|\n## |$)/);
  if (!match) return {};
  const result = {};
  const rows = match[1].split('\n').filter((row) => row.startsWith('|'));
  const headerRow = rows.find((row) => row.includes('Short ID'));
  if (!headerRow) return result;
  const headerCols = headerRow.split('|').map((c) => c.trim()).filter(Boolean);
  const getIndex = (name) => headerCols.findIndex((col) => col.toLowerCase() === name.toLowerCase());
  const idIndex = getIndex('Short ID');
  const trendIndex = getIndex('Trend');
  const trackedIndex = getIndex('Tracked');
  const exactFixIndex = getIndex('Exact Fix');

  for (const row of rows) {
    if (!row.startsWith('|') || /^\|[-| ]+\|$/.test(row)) continue;
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < headerCols.length) continue;
    const id = cols[idIndex];
    const trend = cols[trendIndex];
    const tracked = cols[trackedIndex];
    const exactFix = cols[exactFixIndex];
    if (id && id !== 'Short ID') {
      result[id] = {
        trend: trend || '',
        tracked: /yes/i.test(tracked),
        exactFix: /yes/i.test(exactFix),
      };
    }
  }
  return result;
};

const parseKeySignal = (content) => {
  const m = content.match(/## Key Signal[^\n]*\n\n([\s\S]*?)(?=\n---|\n## |$)/);
  return m ? m[1].trim().slice(0, 600) : '';
};

const parseLineValue = (content, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^${escaped}:\\s+(.+)$`, 'm'));
  return match ? match[1].trim() : '';
};

const parseDate = (content) => {
  const m = content.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : 'unknown';
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: LOCAL_TIME_ZONE });
  } catch { return iso; }
};

const formatLocalDateKey = (iso) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: LOCAL_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(iso));
    const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return iso;
  }
};

// ─── Block builders ──────────────────────────────────────────────────────────

const shortMonth = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: LOCAL_TIME_ZONE }); }
  catch { return ''; }
};

const issueBlock = (issue, meta) => {
  const { tracked, exactFix, trend } = meta || {};
  const [dot, statusLabel] = statusFor(issue, tracked, exactFix, trend);
  const title = humanizeTitle(issue.title);
  const name = firstName(issue.latestEvent && issue.latestEvent.userEmail);
  const users = issue.userCount > 0 ? pluralize(issue.userCount, 'user') : null;

  // Count display: lead with 24h if available, total as quiet context
  let countStr;
  if (issue.countSinceLastFetch != null) {
    countStr = `*${issue.countSinceLastFetch} since last fetch*`;
    const since = issue.firstSeen ? shortMonth(issue.firstSeen) : null;
    const totalNote = since ? `${issue.count.toLocaleString()} total since ${since}` : `${issue.count.toLocaleString()} total`;
    countStr += `  _(${totalNote})_`;
  } else if (issue.count24h != null) {
    countStr = `*${issue.count24h} since prior snapshot*`;
    const since = issue.firstSeen ? shortMonth(issue.firstSeen) : null;
    const totalNote = since ? `${issue.count.toLocaleString()} total since ${since}` : `${issue.count.toLocaleString()} total`;
    countStr += `  _(${totalNote})_`;
  } else {
    // No delta yet — show total with first-seen date for context
    const since = issue.firstSeen ? shortMonth(issue.firstSeen) : null;
    countStr = since
      ? `${issue.count.toLocaleString()} times total  _(since ${since})_`
      : `${issue.count.toLocaleString()} times total`;
  }

  let line1 = `    *${title}*  \`${issue.shortId}\` — ${countStr}`;
  if (users) line1 += `  · ${users} affected`;

  const parts = [];
  if (name) parts.push(`${name} recently affected`);
  if (issue.substatus === 'new') parts.push('*just appeared today*');
  parts.push(statusLabel);
  const line2 = `    _${parts.join(' · ')}_ ${dot}`;

  return {
    type: 'section',
    text: { type: 'mrkdwn', text: `${line1}\n${line2}` },
  };
};

const categoryBlock = (cat, issues, issueMeta) => {
  const totalOccurrences = issues.reduce((s, i) => s + i.count, 0);
  const totalUsers = issues.reduce((s, i) => s + (i.userCount || 0), 0);

  const blocks = [
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${cat.emoji}  *${cat.label}*\n_${cat.subtitle}_\n` +
              `${issues.length} active · ${totalOccurrences.toLocaleString()} occurrences · ${totalUsers} users affected`,
      },
    },
  ];

  for (const issue of issues) {
    blocks.push(issueBlock(issue, issueMeta[issue.shortId]));
  }

  return blocks;
};

// ─── Main builder ─────────────────────────────────────────────────────────────

const buildPayload = (reportPath, reportContent, jsonData, filePermalink) => {
  const date = parseDate(reportContent);
  const issueMeta = parseAllIssuesTable(reportContent);
  const keySignal = parseKeySignal(reportContent);
  const windowLabel = jsonData?.window?.label || parseLineValue(reportContent, 'Fetch window') || 'active fetch window';

  // Use JSON issues if available, else try to hint from markdown
  const issues = jsonData ? jsonData.issues || [] : [];

  // Categorize
  const categorized = new Map();
  const uncategorized = [];
  const newIssues = [];

  for (const issue of issues) {
    let matched = false;
    for (const cat of CATEGORIES) {
      if (cat.match(issue)) {
        if (!categorized.has(cat.id)) categorized.set(cat.id, []);
        categorized.get(cat.id).push(issue);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (issue.substatus === 'new') newIssues.push(issue);
      else uncategorized.push(issue);
    }
  }

  // Build blocks
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `📊 Roll App — Daily Bug Report`, emoji: true },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `*${formatDate(date)}*  ·  All environments  ·  ${windowLabel}` }],
    },
  ];

  // One section per category
  for (const cat of CATEGORIES) {
    const catIssues = categorized.get(cat.id);
    if (catIssues && catIssues.length) {
      blocks.push(...categoryBlock(cat, catIssues, issueMeta));
    }
  }

  // New / uncategorized
  const allOther = [...newIssues, ...uncategorized];
  if (allOther.length) {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `🆕  *New / Uncategorized Issues*\n_Just appeared — needs a look_` },
    });
    for (const issue of allOther) {
      blocks.push(issueBlock(issue, issueMeta[issue.shortId]));
    }
  }

  // Key signal (shortened for non-technical readers)
  if (keySignal) {
    const clean = keySignal
      .replace(/\*\*(.*?)\*\*/g, '*$1*')
      .replace(/`[^`]+`/g, '')
      .replace(/ROLL-WEB-\w+/g, '')
      .replace(/Fix \d+/g, 'latest fix')
      .replace(/\n{2,}/g, '\n')
      .slice(0, 400)
      .trim();
    if (clean) {
      blocks.push({ type: 'divider' });
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `💡  *What we know*\n${clean}` },
      });
    }
  }

  // No issues in window
  if (!issues.length) {
    blocks.push({ type: 'divider' });
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `✅  *All quiet!*  No issues active in the ${windowLabel}.` },
      });
  }

  // Footer
  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: filePermalink
        ? `📎 *<${filePermalink}|Download full report>*  ·  _${path.basename(reportPath)}_  ·  Roll Engineering`
        : `📁 \`${path.basename(reportPath)}\`  ·  Roll Engineering`,
    }],
  });

  return { blocks };
};

// ─── File finder ─────────────────────────────────────────────────────────────

const findReport = () => {
  const fileIdx = process.argv.indexOf('--file');
  if (fileIdx !== -1 && process.argv[fileIdx + 1]) {
    const arg = process.argv[fileIdx + 1];
    const p = path.isAbsolute(arg) ? arg : path.join(REPORTS_DIR, arg);
    if (!fs.existsSync(p)) { console.error(`⚠️  File not found: ${p}`); process.exit(1); }
    return p;
  }
  if (!fs.existsSync(REPORTS_DIR)) { console.error('⚠️  No reports directory found'); process.exit(1); }
  const files = fs.readdirSync(REPORTS_DIR).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse();
  if (!files.length) { console.error('⚠️  No daily reports found'); process.exit(1); }
  return path.join(REPORTS_DIR, files[0]);
};

// ─── Slack API (bot token) ───────────────────────────────────────────────────

const slackApiCall = (method, params, authHeader) => new Promise((resolve, reject) => {
  const body = new URLSearchParams(params).toString();
  const req = https.request({
    hostname: 'slack.com',
    path: `/api/${method}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader || `Bearer ${BOT_TOKEN}`,
      'Content-Length': Buffer.byteLength(body),
    },
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ ok: false }); } });
  });
  req.on('error', reject);
  req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  req.write(body);
  req.end();
});

const putToUrl = (uploadUrl, fileBuffer) => new Promise((resolve, reject) => {
  const url = new URL(uploadUrl);
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': fileBuffer.length },
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: data }));
  });
  req.on('error', reject);
  req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  req.write(fileBuffer);
  req.end();
});

const uploadReportFile = async (reportPath, content, date) => {
  if (!BOT_TOKEN) return null;
  try {
    const fileBuffer = Buffer.from(content, 'utf8');
    const filename = path.basename(reportPath);
    const title = `Sentry Report — ${formatDate(date)}`;

    // Step 1: get upload URL
    const urlRes = await slackApiCall('files.getUploadURLExternal', {
      filename,
      length: fileBuffer.length,
      alt_txt: title,
    });
    if (!urlRes.ok) { console.warn('⚠️  File upload: getUploadURL failed —', urlRes.error); return null; }

    // Step 2: upload content
    await putToUrl(urlRes.upload_url, fileBuffer);

    // Step 3: complete upload
    const completeRes = await slackApiCall('files.completeUploadExternal', {
      files: JSON.stringify([{ id: urlRes.file_id, title }]),
    });
    if (!completeRes.ok) { console.warn('⚠️  File upload: complete failed —', completeRes.error); return null; }

    return completeRes.files?.[0]?.permalink || null;
  } catch (e) { console.warn('⚠️  File upload error:', e.message); return null; }
};

// ─── HTTP poster ─────────────────────────────────────────────────────────────

const post = (payload) => new Promise((resolve, reject) => {
  const url = new URL(WEBHOOK_URL);
  const body = JSON.stringify(payload);
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: data.trim() }));
  });
  req.on('error', reject);
  req.setTimeout(10000, () => req.destroy(new Error('timeout')));
  req.write(body);
  req.end();
});

// ─── Run ─────────────────────────────────────────────────────────────────────

(async () => {
  const reportPath = findReport();
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  const reportDate = parseDate(reportContent);

  // Only use live JSON if it matches the report date (don't mix today's JSON with old reports)
  let jsonData = null;
  if (fs.existsSync(LATEST_JSON)) {
    try {
      const raw = JSON.parse(fs.readFileSync(LATEST_JSON, 'utf8'));
      const jsonDate = formatLocalDateKey(raw.fetchedAt || '');
      if (jsonDate === reportDate) jsonData = raw;
    } catch {}
  }

  const filePermalink = await uploadReportFile(reportPath, reportContent, reportDate);
  if (filePermalink) console.log(`📎 Report file uploaded`);
  else if (BOT_TOKEN) console.warn('⚠️  File upload failed — posting without attachment');

  const payload = buildPayload(reportPath, reportContent, jsonData, filePermalink);

  try {
    const { status, body } = await post(payload);
    if (status === 200 && body === 'ok') {
      console.log(`✅ Sentry report posted to Slack (${reportDate})`);
    } else if (status === 403 || status === 401) {
      console.error('⚠️  Slack not reachable — webhook token invalid or revoked'); process.exit(1);
    } else if (status === 404) {
      console.error('⚠️  Slack not reachable — webhook URL not found (channel deleted?)'); process.exit(1);
    } else {
      console.error(`⚠️  Slack returned unexpected response: HTTP ${status} — ${body}`); process.exit(1);
    }
  } catch (err) {
    const isNetwork = ['ENOTFOUND', 'ECONNREFUSED', 'timeout'].some(c => err.message.includes(c) || err.code === c);
    console.error(isNetwork
      ? '⚠️  Slack not reachable — check your network or try again later'
      : `⚠️  Slack post failed: ${err.message}`);
    process.exit(1);
  }
})();
