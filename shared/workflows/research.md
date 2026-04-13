# Workflow: Research

**Roles**: Expert Programmer · System Design Reviewer · Product Manager · Product Strategist

**This workflow covers**: Investigating a technology, evaluating options, understanding an unfamiliar system, or answering a specific technical or product question before making a decision.
**This workflow does NOT cover**: Debugging a live issue (use `debugging.md`), planning what to build after the decision is made (use `planning.md` or `feature-planning.md`).

---

## Trigger Phrases

- "research [X]"
- "investigate [X]"
- "what are the options for [X]"
- "compare [X] vs [Y]"
- "find out how [X] works"
- "should we use [X] or [Y]"
- "what's the best approach for [X]"

---

## Prime Directive

**Research produces a conclusion, not a dump.**

The output of research is an answer to a specific question that enables a decision.
If the output is a list of everything found, with no recommendation, it has not done its job.
Every research session should end with: here is what we found, here is what it means, here is what we should do.

---

## Prerequisites

Before starting, the research question must be specific enough to answer.

Test it: can you write a one-sentence answer when the research is done?

- **Too vague**: "Research authentication options"
- **Specific enough**: "Which auth approach fits our existing Firebase setup, supports offline-first mobile, and doesn't require a new service?"

If the question is vague → sharpen it with the user before starting.

---

## Step 1: Check What Already Exists

Before going external:

1. Read the relevant project code and docs — the answer may already be there
2. Check `local/memory/` first, then `shared/memory/decisions.md` — has this been decided before?
3. Check the project `AGENTS.md` for existing constraints or prior choices

If the answer already exists → report it and stop. Do not re-research what is already known.

---

## Step 2: Find Primary Sources

Prefer in this order:
1. Official documentation
2. Source code (when it conflicts with documentation, trust the code)
3. Benchmarks and real-world case studies
4. Community discussion and secondary sources

Do not treat vendor claims, blog posts, or AI-generated summaries as primary sources without verifying.

---

## Step 3: Separate Facts from Inferences

For each finding, be explicit about its type:

- **Known** — confirmed directly from a primary source
- **Inferred** — a reasonable conclusion from the evidence, but not directly stated
- **Assumed** — not verified, stated as an assumption

Do not present inferences as facts. The difference matters when staking a decision on it.

---

## Step 4: Reflection Check

Before writing the conclusion:
- Does the evidence actually support the conclusion, or is it being stretched?
- Are there counter-arguments or alternative interpretations?
- What would change the recommendation?

If a strong counter-argument exists → include it in the output.

---

## Step 5: Write a Decision-Ready Conclusion

Structure the output as:

**Answer** — direct response to the original question (one paragraph max)

**Evidence** — what the answer is based on (3–5 key findings, not an exhaustive list)

**Tradeoffs or caveats** — what could change the answer, or what is sacrificed by this choice

**Recommendation** — what to do next (if a decision is needed)

Do not produce an exhaustive notes dump. Filter for what is decision-relevant.

---

## Step 6: Capture Durable Findings

If the research produced a conclusion that will apply across projects or future sessions:
- Add it to `local/memory/` first
- Publish it to `shared/memory/global-memory.md` only if it should help other users too
- Format: `[YYYY-MM-DD] [topic] [active] — finding. Source: link or reference.`

If the finding is project-specific → add it to that project's `AGENTS.md` memory section instead.

---

## When to Stop and Escalate

Stop and raise with the user if:
- The question cannot be answered with available sources — name what is missing
- The research is revealing that the question itself is wrong (the real problem is different)
- Conflicting primary sources cannot be reconciled without a judgment call that should involve the user

---

## Completion Criteria

Research is complete when:
- The original question has a direct answer
- The answer is supported by named primary sources
- Facts are distinguished from inferences
- A recommendation is made (or the reason a recommendation cannot be made is stated)
- Durable findings are captured in the appropriate memory file
