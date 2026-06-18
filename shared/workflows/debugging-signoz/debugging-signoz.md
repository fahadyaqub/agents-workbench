# Workflow: Debugging with SigNoz

**Roles**: Senior Software Engineer . Product Telemetry Analyst . Expert Programmer . Reproduction and Regression Tester

**This workflow covers**: Fetching, grouping, tracking, and interpreting product behavior logs, delay logs, performance traces, and operational telemetry using SigNoz.
**This workflow does NOT cover**: Application exceptions and crash/error tracking (use `debugging-sentry/debugging-sentry.md`), general code-level debugging without telemetry (use `debugging.md`), or implementing a confirmed code fix (use `bugfix.md`).

> SigNoz is the source of truth for what users are doing, where workflows slow down, and whether added behavioral instrumentation is producing useful signal.
> Sentry remains the source of truth for application exceptions and error reporting.

> ⚠️ **Before adding or enriching ANY logging/instrumentation during this workflow, read [`local/memory/logging-discipline.md`](../../../local/memory/logging-discipline.md) first.** Prefer enriching an existing log over adding a new `logCallEvent`; broaden a narrow guard rather than adding a parallel log; keep the number of log calls as low as possible while still capturing what's needed. Required reading — do not add instrumentation without it.

---

## Reminder (always print this first)

Before doing anything else, always print this to the user:

```text
SigNoz commands:
  - "fetch signoz logs" / "fetch signoz logs from the last X hours"
  - "check [point of interest]" - reviews tracked logs and gives a verdict
  - "start tracking [point of interest]" OR "group [events/logs] as [point of interest]"
  - "add what we did to [point of interest] logs"
```

---

## Trigger Phrases

When the user says any of the following, run the SigNoz analysis workflow:

- "fetch signoz logs"
- "pull signoz logs"
- "check signoz"
- "run signoz analysis"
- "check signose"
- "pull signore logs"
- "setup a workflow for signose"
- "what are users doing in [area]"
- "check [point of interest] logs"
- "check [point of interest] with history"
- "what's slow in signoz"
- "why is [flow/endpoint/feature] slow"
- "latency is spiking"
- "something is slow since the deploy"
- "group [events/logs] as [point of interest]"
- "start tracking [point of interest]"

**Default window**: 24 hours. If the user specifies a time (for example "last 10 hours", "since the deploy", or "today"), use that value. If ambiguous, use 24h.

---

## Prime Directive

**Behavior logging must answer a question.**

Do not add logs just because visibility feels nice. Every new log must have:
- a point of interest
- a hypothesis or decision it will test
- expected fields and IDs
- a review window
- a removal, promotion, or follow-up condition

If the tracking file is growing with more logs but no decision, stop and tell the user. The next step should be a sharper hypothesis, not more instrumentation.

## Pipeline Latency Rule

For multi-step processing pipelines, report step-local deltas rather than
absolute time since the overall session began. Anchor the workflow at the
first relevant marker, usually `recording end received` for upload pipelines,
then compute each later marker as:

```text
delta = current marker SigNoz timestamp - previous marker SigNoz timestamp
```

Example upload/merge/autoedit sequence:
1. recording end received: `t = 0`
2. client all-chunks uploaded/sent: `2 - 1`
3. chunk-merge lambda first received work: `3 - 2`
4. all source processing ready for grid/autoeditor: `4 - 3`
5. grid done or failed: `5 - 4`
6. autoeditor done or failed: `6 - 5`

Use SigNoz ingest `timestamp` as the ordering source. Caller-provided
timestamps are diagnostic fields only, because client and backend clocks or
timezones may differ.

---

## When to Use SigNoz vs Sentry

| Symptom or question | Tool |
|---|---|
| App threw an exception | Sentry |
| User behavior, click/path/flow observation | SigNoz |
| Delay, latency, duration, stalled step | SigNoz |
| Product funnel or workflow drop-off | SigNoz |
| Backend/service degradation | SigNoz |
| High error rate on an API | Both |
| User reported a crash | Sentry |
| Need searchable diagnostic IDs around behavior | SigNoz |

---

## Prerequisites

Before starting:
- SigNoz query URL is known. For Roll Web, check `.env` for `SIGNOZ_API_URL`.
- SigNoz API key is available. For Roll Web, check `.env` for `SIGNOZ_API_TOKEN`.
- Use the `SIGNOZ-API-KEY` request header for query API reads.
- Service names are known or discoverable from logs. For Roll Web, common service names are `roll-web-prod`, `roll-web-staging`, and `roll-web-dev`.
- For browser/client logs, OpenTelemetry log ingestion must be active. If no rows appear for a service, stop and say the behavior may not be instrumented yet.

Never print API keys or raw secrets. When showing query output, prefer counts, field names, grouped summaries, and short redacted examples.

---

## Local Workflow Area

Use `local/workspaces/signoz-logs/` as this workflow's private writable area.

- If the folder does not exist yet, create it before writing workflow-owned notes, exported log snapshots, or tracking files.
- Treat this folder as pre-approved writable space for this workflow.
- Keep project-specific implementation changes in the project repo; keep workflow tracking and analysis state in the workbench.

Expected structure:

```text
local/workspaces/signoz-logs/
  latest-logs.json
  fetch-state.json
  daily-analysis/
    YYYY-MM-DD.md
  points-of-interest/
    <poi-slug>.md
  queries/
    <poi-slug>.json
```

Use `local/memory/debugging-signoz.md` for compact durable memory about active points of interest. Keep it under 40 lines unless the user asks for a longer record.

---

## Step 1: Fetch Recent Logs

Fetch recent logs through the SigNoz query API.

For Roll Web, read `SIGNOZ_API_URL` and `SIGNOZ_API_TOKEN` from `.env`.

Roll's SigNoz instance currently reports `v0.120.0` and uses `/api/v5/query_range`.
The v5 request must include `schemaVersion: "v1"` and put every query in
`compositeQuery.queries[]`. Do not use the older shape with
`compositeQuery.queryType`, `panelType`, or `chQueries`; that returns
`unknown field "queryType" in composite query`.

The logs table is `signoz_logs.distributed_logs_v2`. The older
`signoz_logs.distributed_logs` table is not present on this deployment.

Core log columns:

```text
timestamp UInt64 nanoseconds
ts_bucket_start UInt64 seconds
severity_text LowCardinality(String)
body String
attributes_string Map(LowCardinality(String), String)
resources_string Map(LowCardinality(String), String)
```

Service name is available as:

```sql
resources_string['service.name']
```

For precise operational debugging, prefer `clickhouse_sql` queries. They are
less fragile than builder filter syntax when you need to inspect nested
attributes, summarize file states, or correlate across backend/lambda/worker
services.

The v5 ClickHouse SQL request shape is:

```json
{
  "schemaVersion": "v1",
  "start": 1781110800000,
  "end": 1781125800000,
  "requestType": "raw",
  "variables": {},
  "formatOptions": {
    "formatTableResultForUI": false,
    "fillGaps": false
  },
  "compositeQuery": {
    "queries": [
      {
        "type": "clickhouse_sql",
        "spec": {
          "name": "A",
          "query": "SELECT fromUnixTimestamp64Nano(timestamp) AS ts, severity_text, resources_string['service.name'] AS service, substring(attributes_string['Message'], 1, 300) AS msg FROM signoz_logs.distributed_logs_v2 WHERE ts_bucket_start >= toUnixTimestamp(toDateTime('2026-06-10 13:00:00', 'UTC')) AND ts_bucket_start < toUnixTimestamp(toDateTime('2026-06-10 18:30:00', 'UTC')) ORDER BY timestamp DESC LIMIT 100",
          "disabled": false
        }
      }
    ]
  }
}
```

Builder queries are still acceptable for simple service/body filters. The v5
builder query shape is:

```json
{
  "schemaVersion": "v1",
  "start": 1700734490000,
  "end": 1700738090000,
  "requestType": "raw",
  "variables": {},
  "compositeQuery": {
    "queries": [
      {
        "type": "builder_query",
        "spec": {
          "name": "A",
          "signal": "logs",
          "filter": { "expression": "" },
          "order": [
            { "key": { "name": "timestamp" }, "direction": "desc" },
            { "key": { "name": "id" }, "direction": "desc" }
          ],
          "offset": 0,
          "limit": 100
        }
      }
    ]
  }
}
```

Useful filter expressions:

```text
service.name = 'roll-web-prod'
service.name = 'roll-web-staging'
body CONTAINS 'upload'
body CONTAINS 'delay'
body CONTAINS 'collab'
```

Useful ClickHouse diagnostics:

```sql
-- Discover available log tables
SELECT database, name
FROM system.tables
WHERE database ILIKE '%log%' OR name ILIKE '%log%'
ORDER BY database, name
LIMIT 100

-- Inspect log table columns
SELECT name, type
FROM system.columns
WHERE database = 'signoz_logs' AND table = 'distributed_logs_v2'
ORDER BY position

-- Scoped exact-session timeline
SELECT
  fromUnixTimestamp64Nano(timestamp) AS ts,
  severity_text,
  resources_string['service.name'] AS service,
  substring(attributes_string['Message'], 1, 350) AS msg,
  attributes_string['context.parameters.eventType'] AS event,
  attributes_string['context.parameters.status'] AS status,
  attributes_string['context.parameters.name'] AS name
FROM signoz_logs.distributed_logs_v2
WHERE ts_bucket_start >= toUnixTimestamp(toDateTime('<START UTC>', 'UTC'))
  AND ts_bucket_start < toUnixTimestamp(toDateTime('<END UTC>', 'UTC'))
  AND (
    attributes_string['callSessionId'] = '<CALL_SESSION_ID>'
    OR attributes_string['context.parameters.callSessionId'] = '<CALL_SESSION_ID>'
    OR body ILIKE '%<CALL_SESSION_ID>%'
  )
  AND (
    attributes_string['recordingSessionId'] = '<RECORDING_SESSION_ID>'
    OR attributes_string['context.parameters.recordingSessionId'] = '<RECORDING_SESSION_ID>'
    OR body ILIKE '%<RECORDING_SESSION_ID>%'
  )
ORDER BY timestamp ASC
LIMIT 300

-- File event status rollup
SELECT
  attributes_string['context.parameters.eventType'] AS event,
  attributes_string['context.parameters.status'] AS status,
  attributes_string['context.parameters.name'] AS name,
  count() AS c,
  min(fromUnixTimestamp64Nano(timestamp)) AS first_ts,
  max(fromUnixTimestamp64Nano(timestamp)) AS last_ts
FROM signoz_logs.distributed_logs_v2
WHERE <same scoped WHERE>
  AND attributes_string['context.parameters.eventType'] != ''
GROUP BY event, status, name
ORDER BY name, event, status

-- Final worker/lambda evidence after uploads
SELECT
  fromUnixTimestamp64Nano(timestamp) AS ts,
  severity_text,
  resources_string['service.name'] AS service,
  substring(attributes_string['Message'], 1, 800) AS msg
FROM signoz_logs.distributed_logs_v2
WHERE <same scoped WHERE>
  AND resources_string['service.name'] NOT IN ('roll-web-prod', 'production-web')
ORDER BY timestamp DESC
LIMIT 120
```

Write the raw API response, redacted if needed, to `local/workspaces/signoz-logs/latest-logs.json`.

Print to the user:

```text
Fetching SigNoz logs from the last N hours...
```

Then summarize:
- time window
- services queried
- rows scanned
- rows returned
- top event names / log names / body patterns
- fields available for grouping

---

## Step 2: Group by Points of Interest

A point of interest is a workflow, feature area, delay, user action, or product question that needs real-world telemetry.

Examples:
- Collab editor playback start
- Media load and stall recovery
- Upload start to upload complete
- Export creation to export ready
- Auth bootstrap and auto-login
- Video player asset open
- Transcript/caption generation

Group logs by the most specific stable key available, in this order:
1. explicit `poi`, `pointOfInterest`, `flow`, or `featureArea`
2. `context + group + name`
3. log `name`
4. known message/body prefix
5. service + route + operation
6. manually selected query

For each group, compute:
- count in window
- first seen and last seen
- affected users, sessions, calls, edits, files, recordings, or videos when IDs are present
- durations or delay fields if present
- P50/P95/P99 when numeric duration fields exist
- missing IDs that would make the group more useful
- representative redacted examples

Do not group unrelated logs just because they share the same service. Group around product questions.

---

## Step 3: Generate Daily Report

Create `local/workspaces/signoz-logs/daily-analysis/YYYY-MM-DD.md` with this structure:

```markdown
# SigNoz Behavior Analysis - YYYY-MM-DD

## Summary

| Metric | Value |
|--------|-------|
| Window | last N hours |
| Services queried | roll-web-prod, ... |
| Rows scanned | N |
| Logs returned | N |
| Points of interest seen | N |
| Tracked points updated | N |
| New candidate points | N |
| Instrumentation concerns | N |

---

## Priority Points of Interest

### <Point of Interest> - <status>
- **Question**: <what we are trying to learn>
- **Signal**: <what the logs show>
- **Counts**: <count / users / sessions / affected IDs>
- **Delay**: <p50/p95/p99 or not available>
- **Verdict**: improving | stable | regressing | inconclusive | needs instrumentation
- **Next step**: <specific action>

---

## Grouped Logs

| Point of Interest | Count | Users | Sessions | IDs present | Delay fields | Status |
|-------------------|-------|-------|----------|-------------|--------------|--------|
| Media load | 55 | 12 | 18 | fileId, editId | loadMs | tracked |

---

## New Candidate Points

### <Candidate>
- **Why it matters**: <product/debugging value>
- **Existing signal**: <what is already visible>
- **Missing signal**: <what IDs/fields/logs are missing>
- **Recommendation**: track | ignore | add instrumentation | investigate code

---

## Instrumentation Concerns

List logs that are noisy, missing IDs, hard to group, duplicated, or better suited to Sentry.

---

## All Logs Brief Table

| Timestamp | Service | Name/Pattern | Severity | IDs | Notes |
|-----------|---------|--------------|----------|-----|-------|
```

Show the same report summary in the current chat. Do not paste large raw log bodies unless the user asks.

---

## Step 4: Update Point-of-Interest Tracking Files

Tracking files live at:

```text
local/workspaces/signoz-logs/points-of-interest/<poi-slug>.md
```

Agent rules:
- Always append timeline entries.
- Preserve user-written sections exactly.
- Do not overwrite old findings.
- Do not add instrumentation entries unless logs were actually added or the user explicitly asks to record planned instrumentation.

Tracking file format:

```markdown
# <Point of Interest>

- **Status**: active | monitoring | resolved | paused
- **Tracking Started**: YYYY-MM-DD
- **Owner Question**: <what the user wants to learn or improve>
- **Primary Query**: <SigNoz filter expression or query file path>
- **Services**: roll-web-prod, roll-web-staging, ...
- **Expected IDs**: userId, sessionId, callId, editId, fileId, videoId, recordingSessionId

## Why We Care

<Product or engineering reason. What decision this telemetry should help make.>

## Current Hypotheses

- <Hypothesis 1>

## Expected Signal

- <What should appear in logs if the hypothesis is true>
- <What would rule it out>

## Current Instrumentation

| Log/Event | Location | Fields | Purpose | Added |
|-----------|----------|--------|---------|-------|

## Timeline

### [YYYY-MM-DD] SigNoz Observation
- **Window**: last N hours
- **Counts**: N logs, N users/sessions if known
- **Durations**: p50/p95/p99 if available
- **Findings**: <what the logs show>
- **Concerns**: <missing IDs, noisy fields, ambiguous naming>
- **Verdict**: <confirmed / ruled out / inconclusive / needs more signal>

### [YYYY-MM-DD] Instrumentation Added
- **Files changed**: <list>
- **Logs added**: <event names>
- **Why added**: <hypothesis or question>
- **Expected signal**: <what we expect to find>
- **Review window**: <when/how to check>
- **Removal or promotion condition**: <remove debug log, promote to durable behavior event, or keep>

## Open Questions

_None yet._
```

---

## Step 5: Review a Tracked Point of Interest

When the user says "check [point of interest]" or "review [point of interest] with history":

1. Read the tracking file from `points-of-interest/`.
2. Read `latest-logs.json` and any saved query file for that point.
3. Run a fresh SigNoz query for the relevant window.
4. Evaluate every hypothesis and every instrumentation entry from the latest timeline entry.

Answer these directly:
- Did the log fire?
- Did the expected fields appear?
- Are the required IDs present?
- What does the signal prove, rule out, or leave inconclusive?
- Can we improve the product/code now?
- If not, what single additional signal is needed?

Append a `### [YYYY-MM-DD] Diagnostic Review` entry to the tracking file.

Lead the user response with the verdict, not the history.

---

## Step 6: Add or Record New Instrumentation

Only add behavior logs after the tracking file contains a clear reason.

Before editing code, update or create the point-of-interest file with:
- the question
- the hypothesis
- the exact log names to add
- expected IDs and fields
- what the logs should prove or rule out

Implementation guidance:
- Put behavior, action, duration, and delay logs in SigNoz.
- Put exceptions and real error reports in Sentry.
- Include every reachable ID already in scope: `id`, `callId`, `fileId`, `videoId`, `audioId`, `editId`, `recordingSessionId`, `recSesId`, `rsid`, `sessionId`, `participantId`, `userId`, `deviceId`, `segmentId`, `takeId`, `clipId`.
- Prefer stable event names: `<area>.<action>.<phase>` or existing local conventions.
- Include duration fields as numbers in milliseconds, not formatted strings.
- Include environment, route, service, and feature area when available.
- Avoid logging raw user content, transcript text, tokens, signed URLs, or secrets.

After code changes, append an `Instrumentation Added` entry to the tracking file.

---

## Step 7: Update Memory

Update `local/memory/debugging-signoz.md` with only compact durable state:

```markdown
# SigNoz Active Points of Interest

_Last updated: YYYY-MM-DD_

| Point | Status | Signal | Concern | Next Review |
|-------|--------|--------|---------|-------------|
| Media load | active | loadMs p95 high | missing fileId on failure | after next rd deploy |
```

If a project-level memory file exists and the finding is project-specific and durable, add a compact note there too. Keep workbench tracking files as the detailed source of truth.

---

## "Start Tracking <Point of Interest>"

When the user asks to start tracking:

1. Search `latest-logs.json` and fresh SigNoz data for matching event names, body patterns, or service fields.
2. Propose the grouping key in one sentence.
3. Create `points-of-interest/<poi-slug>.md`.
4. Save the query to `queries/<poi-slug>.json` if it is non-trivial.
5. Add the point to `local/memory/debugging-signoz.md`.

If no useful logs exist yet, still create the tracking file with `Status: active` and a `Current Instrumentation` section showing what needs to be added.

---

## "Group <Logs> as <Point of Interest>"

When grouping existing logs:

1. Resolve candidate logs from `latest-logs.json` or a fresh query.
2. Show the matched patterns and counts to the user.
3. Create or update the point-of-interest tracking file.
4. Append a `SigNoz Observation` entry with the grouped counts.
5. Update memory with one row for the group.

The group file is the tracking unit. Do not create separate files for every event unless they answer different product questions.

---

## "Add What We Did to <Point of Interest> Logs"

When the user asks to record recent work:

1. Read the tracking file.
2. Find the date of the last timeline entry.
3. Inspect git changes since that date only for relevant files.
4. Look for SigNoz behavior logs, duration logs, event names, fields, and ID coverage.
5. Append an `Instrumentation Added` or `Fix Attempt` entry explaining:
   - what changed
   - what logs were added or adjusted
   - why they were added
   - expected signal
   - when to review

Do not infer intent if the diff is ambiguous. Say what the code changed and mark the expected signal as unknown.

---

## When to Stop and Escalate

Stop and tell the user if:
- No logs exist for the point of interest and instrumentation is required first.
- A point has gone through two rounds of added logs without a decision.
- Required IDs are missing and the logs cannot be correlated to users/sessions/files/edits.
- The signal belongs in Sentry because it is really an exception or crash.
- The query returns too much noise to interpret safely.

---

## Completion Criteria

A SigNoz session is complete when:
- Recent logs have been fetched or a clear instrumentation gap has been identified.
- Logs are grouped by points of interest, not just dumped chronologically.
- Tracking files are updated for active points.
- Any new instrumentation has a documented reason and expected signal.
- `local/memory/debugging-signoz.md` reflects current active points of interest.
