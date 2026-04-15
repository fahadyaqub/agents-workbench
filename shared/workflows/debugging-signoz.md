# Workflow: Debugging with SigNoz

**Roles**: Expert Programmer · Reproduction and Regression Tester

**This workflow covers**: Investigating latency, performance degradation, service errors, and distributed trace analysis using SigNoz.
**This workflow does NOT cover**: Application exceptions and error tracking (use `debugging-sentry.md`), general code-level debugging (use `debugging.md`), fixing a confirmed issue (use `bugfix.md`).

> SigNoz is an open-source APM: traces, metrics, and logs. It covers what Sentry doesn't — latency, distributed traces, service maps, and infrastructure metrics.

> **Project-specific overrides**: If the project has its own SigNoz docs, read them first.

---

## Trigger Phrases

- "check signoz"
- "what's slow in signoz"
- "check traces for [service]"
- "why is [endpoint/feature] slow"
- "check error rate in signoz"
- "look at the service map"
- "latency is spiking"
- "something is slow since the deploy"

---

## Prime Directive

**Form a hypothesis before drilling into traces.**

SigNoz has deep data. It is easy to spend an hour exploring traces without getting closer to the cause.
Start wide (service map, metrics), narrow to one service, then one operation, then form a hypothesis — before reading any trace in detail.
If you are exploring traces without a specific question, stop and restate what you are trying to confirm.

---

## When to Use SigNoz vs Sentry

| Symptom | Tool |
|---|---|
| App threw an exception | Sentry |
| Endpoint is slow | SigNoz |
| Service is down or degraded | SigNoz |
| High error rate on an API | Both |
| DB query taking too long | SigNoz |
| User reported a crash | Sentry |
| Deploy caused latency spike | SigNoz |
| Memory or CPU spike | SigNoz |

---

## Prerequisites

Before starting:
- SigNoz instance URL (check project `AGENTS.md` or `.env`)
- Access credentials or API token
- Service names as registered in SigNoz (check `List Services` in the UI or API)
- OpenTelemetry instrumentation must be in the codebase — if it isn't, traces won't exist

If traces don't exist for the affected service → stop and tell the user. Instrumentation needs to be added first as a separate task.

---

## Local Workflow Area

Use `local/workspaces/debugging-signoz/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, latency snapshots, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for trace notes, exported screenshots, and hypothesis logs unless the project already has a native performance-report location.

---

## Step 1: Identify the Signal

Set the time range to match the incident window. If unknown, start with the last 1 hour.

Check in this order:
1. **Service map** — which services show elevated error rate or latency?
2. **Metrics dashboard** — are there anomalies in the incident window?
3. **Top operations** — which endpoints or operations are slowest or most errored?

If no anomaly is visible in SigNoz → tell the user. The issue may not be instrumented or may be in a layer SigNoz doesn't cover.

---

## Step 2: Isolate the Service

Pick the single service with the highest error rate or worst latency.

Note these metrics (not just averages):
- **P99 / P95 latency** — average hides outliers
- **Error rate** — errors per total requests
- **Throughput** — a drop may indicate an upstream problem, not this service

Compare against the 7-day average as a baseline if no other baseline exists.

If multiple services are equally affected → check the service map for dependencies. Start with the service that others call, not the one at the edge.

---

## Step 3: Drill Into Traces

Filter traces for the affected service and operation:
- Sort by duration descending → find the slowest traces
- Filter by `status = error` → find failing traces

For each suspicious trace:
1. Expand the span tree — identify which span is slow or errored
2. Check span attributes: DB query text, external call URL, request params
3. Look for the pattern — same DB table? Same downstream service? Same user type?

Once you see the pattern → state the hypothesis before going further.

---

## Step 4: Form a Hypothesis

Write down before touching any code:
- Which service and operation is affected
- What the span tree shows (where time is being spent)
- The likely root cause (examples: missing index, N+1 query, downstream timeout, retry storm)

If you cannot write this clearly → go back to Step 3 and look for more signal.
Do not touch code until the hypothesis is specific enough to test.

---

## Step 5: Correlate With Code and Deploys

1. Check when the issue started — correlate with deploy timestamps in SigNoz or git
2. Run `git log --since="<start-time>" --oneline` — find commits that coincide
3. Read the specific code path identified in the trace

Based on the hypothesis:
- **Slow DB query** → check for missing indexes, unintended full-table scans, N+1 patterns
- **External call timeout** → check for missing timeouts, retry storms, dependency outages
- **High CPU/memory** → check for large allocations, unbounded loops, or cache misses in hot paths

---

## Step 6: Fix and Verify

Hand off to `bugfix.md` for the fix itself.

After the fix is deployed:
- Re-check SigNoz after sufficient traffic (minimum 15–30 minutes)
- Verify P99 latency and error rate have improved
- If metrics have not improved → the hypothesis was wrong. Return to Step 3.

---

## What to Record

After resolving, add a note to the project's `MEMORY.md`:

```markdown
## [YYYY-MM-DD] Performance Fix — <service/operation>
- **Root cause**: <one sentence>
- **Fix**: <what changed>
- **Verified**: P99 dropped from Xms to Yms
```

This prevents the same issue being re-investigated later.

---

## When to Stop and Escalate

Stop and tell the user if:
- No anomaly is visible in SigNoz but the user is reporting slowness — the issue may not be instrumented
- The trace analysis is pointing to a dependency outside your control (third-party API, managed DB)
- The fix has been deployed and verified but latency is not improving
- The investigation has required changes to more than 3 services without a clear fix

---

## Completion Criteria

A SigNoz session is complete when:
- The root cause is identified and confirmed in the trace data
- A fix has been deployed and verified against the SigNoz metrics
- The finding is recorded in `MEMORY.md`
- All temporary instrumentation added during investigation is removed or scheduled for removal
