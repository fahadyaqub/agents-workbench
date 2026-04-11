# Workflow: New Domain

**Roles**: (meta — no domain role. Read and follow the steps directly.)

**This workflow covers**: Creating a new domain file in `shared/domains/`.
**This workflow does NOT cover**: Updating an existing domain file (edit it directly), creating a workflow (use `new-workflow.md`).

---

## Trigger Phrases

- "create a new domain"
- "add a domain for [X]"
- "we need a [X] domain"
- "there's no domain for [X]"

---

## Prime Directive

**A domain file must be self-contained and executable — not a list of links.**

An agent reading a domain file should be able to operate in that domain without opening any external source.
Links are fallbacks, not the main content.
If the file is mostly links with no extracted guidance → it has failed its purpose.

---

## Prerequisites

Before creating the file:
- Confirm the domain does not already exist in `shared/domains/`
- Confirm the domain is broad enough to apply across multiple projects (not project-specific)
- If it is project-specific → put the guidance in that project's `AGENTS.md` instead

---

## Step 1: Research the Domain

Search for existing role libraries, prompt collections, and guides for this domain.

Good sources to check first (see `shared/references.md`):
- Anthropic Prompt Library
- GitHub Copilot custom instructions
- awesome-chatgpt-prompts
- Guro

Look for: what roles exist in this domain? What do practitioners in this domain actually do?

---

## Step 2: Select Three Roles

From your research, pick exactly three roles that:
- Cover meaningfully different aspects of the domain
- Are broad and durable (apply to many situations, not one narrow scenario)
- Represent roles a real practitioner would recognize

Avoid: overly narrow gimmick roles, roles that are just re-phrasings of each other, roles that only apply to one project.

If you find more than three good candidates → note the extras in `shared/references.md` under the domain heading. Do not add more than three roles to the domain file itself unless a fourth is clearly essential.

---

## Step 3: Extract Guidance Into the File

For each role, write:
- **When to use this role** — one or two sentences on which task types trigger it
- **Concise instruction bullets** — what the agent should do when in this role (4–6 bullets)

Distill the source material. Do not copy verbatim. Write instructions that are:
- Specific enough to change agent behavior
- Short enough to be read in a single scan
- Free of jargon the agent would not understand in context

---

## Step 4: Write the Default Blend

Add a short section describing how to combine all three roles when the task type is ambiguous.
This is the "when unsure" fallback — a 3-step sequence that uses each role's strength.

---

## Step 5: Add the More Roles Pointer

At the bottom, add:

```
## More Roles

If you don't find the role you need, check `shared/references.md` under **[Domain Name]** or **General Prompt Libraries**.
Extract the useful behavior and add the new role directly to this file.
```

Do not embed raw links in the domain file. All links belong in `shared/references.md`.
Add the domain's sources to `shared/references.md` under a matching heading.

---

## Step 6: Register the Domain

1. Add the domain to `shared/manifest.md` under **Domain Inference** with a routing description
2. Add the domain's source links to `shared/references.md` under a new heading matching the domain name

---

## Reflection Check

Before finishing, verify:
- Can an agent use this file without opening any external link?
- Are the three roles meaningfully different from each other?
- Do the instruction bullets actually change agent behavior, or are they vague platitudes?
- Is the file free of content that would only apply to one specific project?

---

## When to Stop and Escalate

Stop and ask the user if:
- The domain is too narrow to define three broadly applicable roles
- An existing domain already covers the same ground — consider extending that one instead
- The task type is project-specific — it belongs in `AGENTS.md`, not here

---

## Completion Criteria

A domain file is complete when:
- Three roles are defined with when-to-use guidance and instruction bullets
- The default blend section exists
- The More Roles pointer references `shared/references.md`
- The domain is registered in `shared/manifest.md`
- Sources are added to `shared/references.md`

## Update Rules

- If you discover a better role in the reference sources → add it directly to the domain file
- If the file grows past 5–6 roles → merge overlapping roles rather than letting it accumulate
