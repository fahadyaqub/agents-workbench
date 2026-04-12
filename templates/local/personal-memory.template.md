# Personal Memory

Use this file for durable personal preferences that should not become team-wide defaults.

Suggested entry format:
- `[YYYY-MM-DD] [status] statement`

---

## Tools & Integrations

Tool preferences, account targets, and credentials used by workflows.
Populated automatically during workflow setup — you should not need to edit this manually.

This file is gitignored and stays local to your machine.

Format:
```
- [tool type]: [tool name] — [what it's used for]
- [tool] access_model: [how it's accessed — API key / OAuth / Discord bot / web interface / etc.]
- [tool] account: [username, channel name, or handle]
- [tool] subscription: [plan or tier, if relevant to available features]
- [tool] access_token: [token value]
- [tool] refresh_token: [token value]   ← for OAuth platforms
- [tool] api_key: [key value]           ← for API key platforms
- [tool] discord_token: [token value]   ← for Discord-based tools (e.g. Midjourney)
```
