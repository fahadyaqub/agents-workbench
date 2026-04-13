# Shared Global Memory

Use this file only for shared durable guidance that should apply across projects, domains, and users.
Default new memory to `local/memory/` first. Publish entries here only when they should apply to other users too.

Entry format:
- `[YYYY-MM-DD] [scope] [status] statement`

Examples:
- `[2026-04-11] [global] [confirmed] Prefer `AGENTS.md` as the single source of truth for project agent instructions.`
- `[2026-04-11] [engineering] [confirmed] Prefer additive project bootstrap changes over replacing existing instructions files.`

---

- `[2026-04-12] [global] [confirmed]` Workflow generation must be smart and holistic, not mechanical. Before writing a workflow, map the full user journey end-to-end: what happens before, during, and after. Surface gaps (missing storefront, no order handling, no distribution path) and recommend or create adjacent workflows. A workflow that completes a task but leaves the user unable to act on the result has failed.

- `[2026-04-12] [global] [confirmed]` Platform research must be independent. When a workflow publishes or distributes to an audience, research the best platforms for the content type before accepting what the user says. If a better option exists, say so directly with a concrete reason. Do not passively validate a suboptimal choice.

- `[2026-04-12] [global] [confirmed]` Recurring workflows should be queue-driven when input is provided in batch. The user provides all inputs upfront (book, topic list, content calendar); the workflow maintains a queue.md and auto-advances. Four modes: drip (one per run), burst (N per run), batch (all at once), drip+approval (one per run, waits for user sign-off before advancing). Time-windowed queues support items with availability windows (e.g. seasonal produce) — pick the most urgently-expiring in-window item, not the next in sequence.

- `[2026-04-12] [global] [confirmed]` Approval steps must be refinement loops, not binary gates. Present the output, then invite the user to request specific changes, alternatives, or full regenerations. Loop until explicit approval is given. Never interpret silence or a vague positive as approval before an irreversible action.

- `[2026-04-12] [global] [confirmed]` Enhance user-provided media, never replace it. When a user provides their own photos or videos, authenticity is the point. Improve lighting, sharpness, and composition using AI enhancement tools — but the result must still look like the user's actual content. Do not generate synthetic replacements because the original was imperfect.

- `[2026-04-12] [global] [confirmed]` Credentials for non-technical users should be stored directly in local/personal-memory.md. This file is gitignored. Telling a non-technical user to "use environment variables" is security theater — a .env file and a markdown file are both plain text. Match the advice to who will actually use it.

- `[2026-04-12] [global] [confirmed]` Roles and domains must be determined independently before checking existing files. Think: who does this work in the real world, and what domain do they belong to? Only then check shared/domains/. If the domain or role doesn't exist, create it — search references.md first, then the web if needed. Never force-fit an existing role from a different domain.

- `[2026-04-13] [global] [confirmed]` Prefer a zero-install, file-native workbench over custom local runtimes. Shared memory, a shared knowledgebase, and a consistent way of working are the core system; agents should derive execution from the environment and tools they already have before introducing new software requirements.

- `[2026-04-13] [global] [confirmed]` New memory, workflows, domains, and agent support should begin in `local/` and only move into `shared/` when intentionally published. Local and shared are scope boundaries, not quality levels: local items are fully usable for one user; shared items are meant to help everyone.
