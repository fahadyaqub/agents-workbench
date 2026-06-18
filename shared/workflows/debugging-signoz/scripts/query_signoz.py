#!/usr/bin/env python3
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request


DEFAULT_API_URL = "https://log.roll.ai/api/v5/query_range"
DEFAULT_ENV_PATHS = [
    os.path.join(os.getcwd(), ".env"),
    "/Users/fahadyaqub/work/roll/roll-web/.env",
]


def load_env(env_path):
    env_vars = {}
    if not env_path or not os.path.exists(env_path):
        return env_vars

    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars


def resolve_env_path(explicit_path):
    if explicit_path:
        return explicit_path
    for path in DEFAULT_ENV_PATHS:
        if os.path.exists(path):
            return path
    return ""


def to_ms(value, default):
    if not value:
        return default
    parsed = value.strip()
    if parsed.isdigit():
        return int(parsed)
    if parsed.endswith("Z"):
        parsed = parsed[:-1] + "+00:00"
    try:
        from datetime import datetime

        return int(datetime.fromisoformat(parsed).timestamp() * 1000)
    except ValueError:
        print(f"Invalid timestamp: {value}", file=sys.stderr)
        sys.exit(1)


def build_builder_query(expression, limit):
    return {
        "type": "builder_query",
        "spec": {
            "name": "A",
            "signal": "logs",
            "filter": {"expression": expression or ""},
            "order": [
                {"key": {"name": "timestamp"}, "direction": "desc"},
                {"key": {"name": "id"}, "direction": "desc"},
            ],
            "offset": 0,
            "limit": limit,
        },
    }


def build_sql_query(query):
    return {
        "type": "clickhouse_sql",
        "spec": {
            "name": "A",
            "query": query,
            "disabled": False,
        },
    }


def query_signoz(args):
    env_path = resolve_env_path(args.env)
    env = load_env(env_path)
    api_url = env.get("SIGNOZ_API_URL") or os.environ.get("SIGNOZ_API_URL") or DEFAULT_API_URL
    api_token = env.get("SIGNOZ_API_TOKEN") or os.environ.get("SIGNOZ_API_TOKEN")

    if not api_token:
        print("Error: SIGNOZ_API_TOKEN not found in .env or environment", file=sys.stderr)
        sys.exit(1)

    now_ms = int(time.time() * 1000)
    start_ms = to_ms(args.start, now_ms - (args.hours * 60 * 60 * 1000))
    end_ms = to_ms(args.end, now_ms)

    payload = {
        "schemaVersion": "v1",
        "start": start_ms,
        "end": end_ms,
        "requestType": "raw",
        "variables": {},
        "formatOptions": {
            "formatTableResultForUI": False,
            "fillGaps": False,
        },
        "compositeQuery": {
            "queries": [
                build_sql_query(args.query) if args.sql else build_builder_query(args.query, args.limit)
            ]
        },
    }

    headers = {
        "Content-Type": "application/json",
        "SIGNOZ-API-KEY": api_token,
    }

    mode = "clickhouse_sql" if args.sql else "builder_query"
    print(
        f"Querying SigNoz: url={api_url}, mode={mode}, env={env_path or '<env only>'}, start={start_ms}, end={end_ms}, limit={args.limit}",
        file=sys.stderr,
    )

    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode("utf-8")
            if response.status != 200:
                print(f"Response Status: {response.status}", file=sys.stderr)
                print(body, file=sys.stderr)
                sys.exit(1)
            return json.loads(body)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}", file=sys.stderr)
        print(e.read().decode("utf-8", errors="ignore"), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Request failed: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Query SigNoz v5 logs.")
    parser.add_argument("query", help="Builder filter expression, or ClickHouse SQL when --sql is set.")
    parser.add_argument("hours", nargs="?", type=int, default=72, help="Lookback hours when --start is omitted.")
    parser.add_argument("limit", nargs="?", type=int, default=100, help="Builder query limit.")
    parser.add_argument("--sql", action="store_true", help="Treat query as raw ClickHouse SQL.")
    parser.add_argument("--env", help="Path to .env containing SIGNOZ_API_URL and SIGNOZ_API_TOKEN.")
    parser.add_argument("--start", help="Start time as epoch ms or ISO timestamp.")
    parser.add_argument("--end", help="End time as epoch ms or ISO timestamp.")
    args = parser.parse_args()

    print(json.dumps(query_signoz(args), indent=2))


if __name__ == "__main__":
    main()
