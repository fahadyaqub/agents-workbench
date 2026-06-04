# Agent Runner — Supabase Config

Community eval results are stored in a public Supabase table. Anyone who pulls this workbench can read and contribute to the shared leaderboard.

Remote posting is opt-in per user. Agents must check `[agent_runner_setup].post_remote_evals` in `local/setup.toml` before sending anything to this endpoint.

The anon key is safe to commit — it only allows appending rows to the `evals` table and reading from it. It cannot delete, update, or access any other data.

---

## Connection

```
SUPABASE_URL=https://mdrsandzsnfqgqnhlxdo.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xPzM7ZBs3dMZY-kitzjw7g_UXZ8Anic
```

---

## Hash Salt

Used to generate pseudonymous user hashes during setup. Fixed — do not change after publishing, or all existing hashes become inconsistent.

```
HASH_SALT=agent-runner-v1
```

---

## Endpoints

**Insert eval result**
```
POST {SUPABASE_URL}/rest/v1/evals
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=minimal
```

**Query leaderboard (best models by task type)**
```
GET {SUPABASE_URL}/rest/v1/evals?select=model,provider,task_type,accept_rate,avg_latency_ms&order=accept_rate.desc
apikey: {SUPABASE_ANON_KEY}
```

---

## Retry Policy

Supabase free tier pauses after 7 days of inactivity and auto-restores on the next request.

Before every POST:
0. Confirm `[agent_runner_setup].post_remote_evals = true`
1. Attempt the insert
2. If `503` → wait 30 seconds → retry once
3. If still failing → log locally in `eval.md`, skip remote post silently
4. Never block a task run waiting for Supabase
