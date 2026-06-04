---
name: agent-runner-seed
description: Shared structural rules for the agent-runner pattern — fast-path bypass conditions, model guidance, and known failure patterns. Read-only for users. Maintained by workbench owner.
---

# Agent Runner — Shared Seed

This is the structural baseline every user reads before their own contributions. Do not append personal learnings here. Those go in `shared/memory/agent-runner/<your-username>.md`.

---

## Structural Delegate-Only-If Rules (always apply)

Delegate only when all of these are true:

| Rule | Reason |
|------|--------|
| Task is execution-heavy, not conversational | Runner overhead must buy real leverage |
| Expected inline time is > ~10 minutes | Short tasks are faster inline |
| Task decomposes into 3+ independent subtasks | Parallelism has to pay for spec-writing |
| Each subtask has a binary completion criterion | Results must be reviewable |
| Specs can be written without live worker tool access | Workers are one-shot prompts |
| No secrets or sensitive proprietary context must be sent | Do not leak private material to providers |
| Task type has not repeatedly failed in learnings | Calibration should compound |

---

## Structural Fast-Path Rules (always apply)

These fire in Step 0b before checking any personal fast-path rules.

| Rule | Reason |
|------|--------|
| Task takes < ~5 min inline → bypass | Spec-writing overhead exceeds execution time |
| Fewer than 3 independent subtasks → bypass | No meaningful parallelism |
| Task requires tool use, browsing, or live filesystem access → bypass | Workers are one-shot prompts; they cannot use tools |
| Task is a clarifying conversation or open question → bypass | Not an execution task |
| Task requires tight back-and-forth with the user → bypass | Cannot be pre-specified |
| Advisory workflow/design reviews → bypass | Value is in integrated judgment unless the user asks for parallel critiques |
| Required context contains secrets or sensitive proprietary material → bypass | Do not send it to providers |
| > 30% of tasks fail in a single run → stop, redo decomposition | The problem is spec quality, not model quality |

---

## Free Model Selection by Provider

### OpenRouter (free tier)

| Task type | Model |
|-----------|-------|
| Simple transforms, renaming, boilerplate | `mistralai/mistral-7b-instruct:free` |
| Moderate reasoning, logic, data shaping | `meta-llama/llama-3.1-8b-instruct:free` |
| Code quality matters | `mistralai/mistral-small-3.1-24b-instruct:free` |
| Deep reasoning, complex rewrites | `deepseek/deepseek-r1:free` |

### Groq (free tier, rate-limited but fast)

| Task type | Model |
|-----------|-------|
| Simple transforms, low latency priority | `llama-3.1-8b-instant` |
| Moderate reasoning | `gemma2-9b-it` |
| Higher quality, still free | `llama-3.3-70b-versatile` |
| Long context tasks | `mixtral-8x7b-32768` |

**Groq vs OpenRouter tradeoff**: Groq is significantly faster (tokens/sec) and free, but rate-limited. Use Groq for small high-volume batches. Use OpenRouter when Groq rate limits would stall the run.

---

## Known Failure Patterns (structural)

**Context-blind failures** — Free models cannot infer repo conventions. Every spec must inline the relevant conventions or output will be incompatible.

**Format drift** — Without a strict Output Format section, models add prose wrappers. Always specify the exact output shape.

**Dependency assumptions** — Models assume they can call APIs or read files. If external state is needed, provide a snapshot inline.

**Over-application** — If writing the spec takes longer than 2 minutes, the task is probably not worth delegating.

**Secret leakage** — Specs are sent to external providers. Never include API keys, credentials, private tokens, raw customer data, or sensitive proprietary context.

---

## Eval Benchmarks

| Metric | Healthy | Investigate if |
|--------|---------|----------------|
| Accept rate | > 70% | < 50%: specs too vague or decomposition too coarse |
| Escalation rate | < 20% | > 40%: wrong model tier or task type unsuitable |
| Time saved vs inline | faster or neutral | slower twice in a row: add a fast-path rule |
| Worth delegating | yes | no twice in a row: add a fast-path rule for that task type |

---

## Reading the Contributions Folder

When reading learnings in Step 0a, read all files in `shared/memory/agent-runner/` except `seed.md`. Each file is one team member's promoted lessons. Treat each entry as advisory — it is experience from a real run, not a rule. Weight entries that match your current task type and project context.
