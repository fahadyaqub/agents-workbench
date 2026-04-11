# Workflow: Debugging with SigNoz

**Roles**: Expert Programmer · Reproduction and Regression Tester

Use this workflow when investigating performance issues, errors, or service health using SigNoz.

> SigNoz is an open-source APM and observability platform (traces, metrics, logs).
> It covers what Sentry doesn't: latency, distributed traces, service maps, and infra metrics.
> Use Sentry for application errors. Use SigNoz for performance, latency, and service-level issues.

> **Project-specific overrides**: If the project has its own SigNoz docs, read them first.

---

## Setup Prerequisites

- SigNoz instance URL (check project `AGENTS.md` or `.env`)
- Access credentials or API token
- Service names as they appear in SigNoz (check with `List Services` in the UI or API)
- OpenTelemetry instrumentation must already be in the codebase for traces/metrics to exist

---

## Trigger Phrases

- "check signoz"
- "what's slow in signoz"
- "check traces for [service]"
- "why is [endpoint/feature] slow"
- "check error rate in signoz"
- "look at the service map"

---

## When to Use SigNoz vs Sentry

| Symptom | Tool |
|---------|------|
| App threw an exception | Sentry |
| Endpoint is slow | SigNoz |
| Service is down | SigNoz |
| High error rate on an API | Both |
| DB query taking too long | SigNoz |
| User reported a crash | Sentry |
| Deploy caused latency spike | SigNoz |

---

## Step 1: Identify the Signal

Start with the broadest view before narrowing.

Check in order:
1. **Service map** — any services showing high error rate or elevated latency?
2. **Metrics dashboard** — look for anomalies in the time range around the incident
3. **Top operations** — which endpoints or operations are slowest or most errored?

Set the time range to match the incident window. If unknown, start with the last 1 hour.

---

## Step 2: Isolate the Service

Pick the service with the highest error rate or worst latency.

Key metrics to note:
- P99 / P95 latency (not just average)
- Error rate (errors / total requests)
- Throughput (requests/sec) — a drop here may indicate a different upstream problem

Compare against baseline. If you don't have a baseline, use the 7-day average.

---

## Step 3: Drill Into Traces

Filter traces for the affected service and operation:
- Sort by duration descending to find the slowest traces
- Filter by `status = error` to find failing traces

For each suspicious trace:
1. Expand the span tree — identify which span is slow or errored
2. Check span attributes: DB query text, external call URL, user ID, request params
3. Look for patterns — same DB table? Same downstream service? Same user?

---

## Step 4: Form a Hypothesis

Before investigating code, write down:
- Which service and operation is affected
- What the span tree shows (where time is spent)
- The likely root cause (slow query, N+1 problem, downstream timeout, etc.)

Do not start fixing until the hypothesis is specific enough to test.

---

## Step 5: Correlate with Code and Deploys

1. Check when the issue started — correlate with deploy timestamps
2. Run `git log --since="<start-time>" --oneline` to find relevant commits
3. Look at the specific code path identified in the trace
4. If it's a DB query: check for missing indexes, unintended full-table scans, or N+1 patterns
5. If it's an external call: check for missing timeouts, retry storms, or dependency outages

---

## Step 6: Fix and Verify

- Make the targeted fix
- Deploy to a staging environment first if possible
- Re-check SigNoz after sufficient traffic (at least 15–30 minutes post-deploy)
- Verify P99 latency and error rate have improved

---

## What to Record

After resolving, add a note to the project's `MEMORY.md` or `shared/memory/global-memory.md`:
- What was slow/broken
- Root cause
- Fix applied
- Date resolved

This prevents the same issue being re-investigated later.
