# Design Principles

This workbench is intentionally small, file-native, and zero-install.

## Core Thesis

Agents become meaningfully better when they share:
- durable evolving memory
- a common knowledgebase
- a consistent way of working

Those three layers are the system. Everything else is optional.

## Design Constraints

- Zero-install: do not require users to install a custom local runtime just to use the workbench
- Tiny footprint: keep the repository small, inspectable, and easy to carry across workspaces
- Plain files first: prefer Markdown, templates, and simple folder conventions over hidden machinery
- Private scope first: new memory, workflows, domains, and agent support should begin in `local/` and only become shared when intentionally published
- Agent-agnostic: the same workbench should guide any capable agent through the same operating model
- Human-editable: users should be able to read, audit, and improve the system directly

## Non-Goals

- Do not become a heavyweight app platform
- Do not depend on Python, Node, or a background service to be useful
- Do not replace the agent's existing tools when shared memory, knowledge, and workflow guidance are enough

## Practical Implication

When deciding between adding software and improving the workbench itself, prefer the lightest option that strengthens shared memory, shared knowledge, or consistency of execution.
Default new artifacts to `local/`. Publish them into `shared/` only when they are intended to help other users too.
