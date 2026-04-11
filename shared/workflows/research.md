# Workflow: Research

**Roles**: Expert Programmer · System Design Reviewer · Product Manager · Product Strategist

---

## When to Use This Workflow

Research tasks: investigating a technology, evaluating options, understanding an unfamiliar system, finding best practices, or answering a specific technical question before making a decision.

Not for: debugging (use `debugging.md`), planning (use `planning.md` or `feature-planning.md`).

---

## Step 1: Define the Question

Research without a clear question produces a dump, not an answer.

Before starting, write down:
- The specific question being answered
- What format the answer should take (comparison table, recommendation, explanation, etc.)
- What decision or action this research will inform

If the question is fuzzy, sharpen it before starting. "Research authentication options" is not a question. "Which auth approach fits our existing Firebase setup and supports offline-first mobile?" is.

---

## Step 2: Start With What You Have

Before going external:
- Read the relevant project code and docs
- Check `shared/memory/` for prior decisions on the same topic
- Check the project `AGENTS.md` for existing constraints or prior choices

Don't research something the codebase already answers.

---

## Step 3: Go to Primary Sources

Prefer:
- Official documentation over blog summaries
- Source code over documentation when they conflict
- Benchmarks and real-world case studies over vendor claims
- Recent sources over old ones for fast-moving topics

---

## Step 4: Distinguish Facts From Inferences

Be explicit about what is:
- **Known** — confirmed from a primary source
- **Inferred** — reasonable conclusion from the evidence
- **Assumed** — not verified, stated as an assumption

Do not present inferences as facts. The difference matters when making decisions.

---

## Step 5: Produce a Useful Conclusion

Research output should answer the original question and enable a decision.

Structure as:
- **Answer** — direct response to the question
- **Evidence** — what it's based on
- **Tradeoffs or caveats** — what could change the answer
- **Recommendation** — what to do (if a decision is needed)

Do not produce an exhaustive notes dump. Filter for what's decision-relevant.

---

## Step 6: Capture Durable Findings

If the research produced a conclusion that will apply across projects or future sessions:
- Add it to `shared/memory/global-memory.md`
- Format: `[YYYY-MM-DD] [topic] [active] — finding. Source: link or reference.`

If the finding is project-specific, add it to that project's `AGENTS.md` memory section instead.
