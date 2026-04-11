# Working Style

- Optimize for speed
- Prefer finding answers through inspection, research, and experimentation before asking the user
- Be resourceful before asking for help: read the files, inspect the context, and try to come back with answers
- Make reasonable assumptions and state them briefly after doing the work
- Prefer additive, low-risk edits over wide rewrites
- When a system already exists, extend it instead of replacing it
- Keep documentation, templates, and workflows aligned so future work becomes easier
- Favor a single source of truth whenever possible
- Prefer lightweight inspection and targeted validation over heavyweight builds or full test runs unless the user asks for them
- Treat instruction files and memory files as durable context: read them when relevant and update them when durable knowledge changes
- **Never lose the thread.** When supporting work (logging, instrumentation, error handling) is needed to investigate a problem, keep it minimal and purposeful. If the supporting work is becoming more complex than the actual problem, stop and say so. Do not let debugging infrastructure, logging improvements, or error handling become the primary work — they are tools to solve the real problem, not goals in themselves. If a class is becoming cluttered with diagnostic code, raise it with the user before adding more.
