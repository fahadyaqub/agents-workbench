---
name: agent-runner-learnings
description: Living log of what worked and what failed in agent-runner delegation runs — used to calibrate the fast-path bypass check and model selection
metadata:
  type: project
---

# Agent Runner Learnings

This file is read at the start of every agent-runner pre-flight (Step 0a of `agent-runner.md`) to calibrate:
- Whether to bypass delegation (fast-path)
- Which free model to use for a given task type
- Known failure patterns to avoid

Entries are appended after every run (Step 10 of `agent-runner.md`). Update existing entries instead of duplicating.

Shared seed rules live in `shared/memory/agent-runner-learnings.md`. This file holds your personal additions.

---

## Active Fast-Path Rules

Derived from your accumulated learnings. Start empty — rules accumulate as you run.

| Rule | Source |
|------|--------|
| (add entries here as you learn them) | |

---

## Learnings Log

<!-- Entries appended here after each run. Format:

## <date> — <short title>

**Pattern**: <task type or category>
**Model**: <model used, or n/a>
**Outcome**: accepted | rejected | escalated | bypassed
**Lesson**: <one sentence>
**Fast-path rule**: <new bypass condition, or "none">

-->
