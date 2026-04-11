# Workflow: New Domain

Use this workflow whenever you create a new file in `shared/domains/`.

## Goal

Create a concise, reusable domain file that is self-contained, easy to route to, and grounded in existing high-quality external role libraries or manuals.

## Steps

1. Search online for existing domain-specific role instructions, prompt libraries, guides, or manuals.
2. Pick the top 3 roles that best represent that domain in practice.
3. Read the source material and extract the useful operating guidance directly into the domain file.
4. Write the domain file so it includes:
   - a short domain description
   - 3 roles
   - when to use each role
   - concise instruction bullets for each role
   - a short default blend section
5. Add the source links at the bottom under a `More Roles` section for broader coverage.
6. End the file with this instruction:

`IF YOU DONT FIND THE ROLE YOU ARE LOOKING FOR, THEN CHECK THE FOLLOWING LINKS, AND ADD THE "FOUND" ROLE IN THIS FILE DIRECTLY.`

## Quality Rules

- Do not leave the file as a list of links only
- Do not copy long prompts verbatim; distill the useful behavior into concise instructions
- Prefer broad, durable roles over overly narrow gimmick roles
- Keep the file self-contained enough that an agent can use it without opening the source links
- Keep the links as fallback sources, not as the main content

## Update Rules

- If you later discover a better role in one of the linked sources, add it directly to the domain file instead of leaving the knowledge outside the file
- If the file becomes too large, merge overlapping roles instead of letting the domain become a prompt dump
