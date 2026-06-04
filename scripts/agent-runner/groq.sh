#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: scripts/agent-runner/groq.sh <model> <task-spec.md>" >&2
  exit 64
fi

if [ -z "${GROQ_API_KEY:-}" ]; then
  echo "GROQ_API_KEY is required" >&2
  exit 65
fi

MODEL="$1"
SPEC_FILE="$2"

python3 - "$MODEL" "$SPEC_FILE" <<'PY' | curl -sS --fail-with-body https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @-
import json
import pathlib
import sys

model = sys.argv[1]
spec = pathlib.Path(sys.argv[2]).read_text()

payload = {
    "model": model,
    "messages": [
        {
            "role": "system",
            "content": "You are a precise code assistant. Follow the task spec exactly. Produce only the requested output format.",
        },
        {"role": "user", "content": spec},
    ],
    "temperature": 0.1,
}

print(json.dumps(payload))
PY
