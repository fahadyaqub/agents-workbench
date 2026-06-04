# Workflow: Agent Runner Setup

**Roles**: All

**Input model**: one-time per user

**This workflow covers**: First-time configuration of the agent-runner workflow — selecting free model providers, storing API keys in the local (gitignored) personal memory file, setting runner mode, setting remote eval preference, and creating the user's personal contributions file in shared memory.

**This workflow does NOT cover**: Running actual agent-runner tasks (use `agent-runner.md`), changing keys after setup (edit `local/personal-memory.md` directly).

---

## Trigger Phrases

- "set up agent runner"
- "configure agent runner"
- "add my openrouter key"
- "add my groq key"
- "set up free model providers"
- "agent runner first time setup"

## Auto-Trigger

This workflow also runs automatically when:
- `local/setup.toml` contains `[agent_runner_setup]` with `status = "pending"`
- The agent-runner pre-flight (Step 0) is about to fire but no provider is configured in `local/personal-memory.md`

---

## Prime Directive

**API keys are private. They go in `local/personal-memory.md` only.**

That file is gitignored. It never leaves the machine. Do not write keys anywhere in `shared/`.

---

## Step 1: Check Current State

Read `local/setup.toml`. If `[agent_runner_setup]` is `complete`, tell the user setup is already done and show configured provider names, runner mode, remote-eval preference, username, and user hash from setup state. Do not print API keys. Ask if they want to reconfigure. If no → stop.

Read `local/personal-memory.md` only far enough to check whether provider keys exist. Do not copy, print, summarize, or store full key values anywhere else.

---

## Step 2: Choose Providers

Ask the user which free model providers they want to use:

**OpenRouter**
- Free tier with rate limits — wide model selection, large context windows
- API key from: https://openrouter.ai/keys
- Good for: most tasks, variety of models

**Groq**
- Free tier, very fast (high tokens/sec), stricter rate limits
- API key from: https://console.groq.com/keys
- Good for: high-volume small-task batches, latency-sensitive runs

Recommended: configure both. The workflow will use Groq first (speed), fall back to OpenRouter when Groq rate limits are hit.

If the user already has a key for one provider → pre-confirm it, only ask for missing ones.

---

## Step 2a: Choose Runner Mode and Remote Eval Preference

Ask the user which runner mode they want:

- `suggest` — default. The agent tells the user when delegation looks useful before invoking workers.
- `auto` — the agent may invoke workers automatically when the delegate-only-if gate passes.
- `off` — the agent never invokes workers unless the user explicitly asks.

Ask whether remote community eval posting should be enabled. Default is `false`.

Remote evals contain metrics and task categories, not task content, but they still leave the machine. Keep them disabled unless the user explicitly opts in.

---

## Step 3: Collect API Keys

For each selected provider, ask for the API key.

Write each key to `local/personal-memory.md` under the `## Tools & Integrations` section:

```
- openrouter api_key: <key>
- groq api_key: <key>
```

Do not echo the keys back in full. Confirm with: "OpenRouter key saved (ending in ...XYZ)."

---

## Step 4: Set Username and Generate User Hash

Ask: "What username should identify your contributions in shared memory?"

Defaults to check in order:
1. Git user name: `git config user.name` (lowercased, spaces to `-`)
2. Username portion of git email: `git config user.email`
3. Ask explicitly if neither is available

Then generate a pseudonymous hash for community submissions:

```bash
# Read salt from shared/memory/agent-runner/config.md (HASH_SALT value)
echo -n "<git_email>:<HASH_SALT>" | sha256sum | cut -c1-16
```

If `sha256sum` is not available, use `shasum -a 256` (macOS) or any equivalent.

Write both to `local/personal-memory.md`:
```
- agent_runner username: <username>
- agent_runner user_hash: <16-char hash>
```

The hash is what gets posted to the community database — never the email or username. It is consistent across machines for the same git email.

---

## Step 5: Create Personal Contributions File

Check if `shared/memory/agent-runner/<username>.md` already exists.

If not, create it:

```markdown
---
name: <username>-agent-runner-contributions
username: <username>
---

# Agent Runner Contributions: <username>

Promoted learnings from <username>'s agent-runner runs. Only <username> writes to this file.

---

## Fast-Path Rules

| Rule | Learned on |
|------|-----------|

---

## Learnings Log

<!-- Promoted entries from local/memory/agent-runner-learnings.md go here.
Only write an entry when it is repeatable, specific, and actionable beyond one project.

Format:
## <date> — <short title>
**Pattern**: <task type>
**Model**: <model or n/a>
**Outcome**: accepted | rejected | escalated | bypassed
**Lesson**: <one sentence>
**Fast-path rule**: <new bypass condition, or "none">
-->
```

---

## Step 6: Initialize Local Learnings File

Check if `local/memory/agent-runner-learnings.md` exists. If not, create it from `templates/local/agent-runner-learnings.template.md`.

Register it in `local/manifest.toml` under `[memory].entries` if not already present.

---

## Step 7: Mark Setup Complete

Update `local/setup.toml`:

```toml
[agent_runner_setup]
status = "complete"
providers = ["openrouter", "groq"]   # list only the ones configured
username = "<username>"
user_hash = "<16-char hash>"
configured_at = "<date>"
mode = "suggest"
post_remote_evals = false
```

---

## Step 8: Confirm

Tell the user:
- Which providers are configured
- Runner mode and remote eval preference
- Where their contributions file lives: `shared/memory/agent-runner/<username>.md`
- That their community identity is a pseudonymous hash (never their email or username)
- That API keys are stored in `local/personal-memory.md` (gitignored, never committed)
- That remote eval results will be posted to the community Supabase table only if `post_remote_evals = true`
- If `shared/memory/agent-runner/config.md` still has `REPLACE_WITH_*` placeholders → community posting is disabled until the workbench owner fills them in. Local and shared-file learnings still work normally.

---

## Completion Criteria

Setup is complete when:
- At least one provider key is stored in `local/personal-memory.md`
- `agent_runner user_hash` is stored in `local/personal-memory.md`
- `shared/memory/agent-runner/<username>.md` exists
- `local/memory/agent-runner-learnings.md` exists
- `local/setup.toml` has `[agent_runner_setup] status = "complete"` with `user_hash`, `mode`, and `post_remote_evals` populated
