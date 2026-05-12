#!/usr/bin/env bash
# check-cdn-cors.sh — debug helper for hls_network_fatal_cors investigation.
#
# Browser telemetry can tell us "fetch failed" but cannot show CORS response
# headers when the browser blocks the response. This script is the
# server-side ground truth: same URL, same Origin header hls.js would send,
# print every response header so we can see exactly what CloudFront returned.
#
# Lives in the agents-workbench so it's reusable across projects:
#   shared/workflows/debugging-sentry/scripts/check-cdn-cors.sh
#
# Usage (from the workbench root):
#   shared/workflows/debugging-sentry/scripts/check-cdn-cors.sh "<full-signed-url>" [origin]
#
# Or call it directly with an absolute path. Defaults origin to
# https://rd2.app.roll.ai. Pair with a Sentry event's URL to confirm
# whether ACAO/Vary/etc. were present.
#
# Output sections:
#   1. Plain GET — what the actual hls.js request would see
#   2. CORS preflight (OPTIONS) — required for credentialed requests with
#      non-simple headers; even though HEAD with no extra headers shouldn't
#      preflight, we run this to confirm CloudFront answers OPTIONS correctly
#   3. HEAD with Origin — what our in-app HEAD probe sees
#
# Why this exists: investigating ambiguous "code 0" errors from hls.js
# where the in-app HEAD probe cannot dispositively confirm CORS — browsers
# hide blocked CORS response headers from JS, and ACAO is not on the
# CORS-safelisted-response-headers list, so r.headers.get('access-control-
# allow-origin') returns null even on healthy responses unless the server
# sends Access-Control-Expose-Headers (CloudFront does not by default).
# This script bypasses the browser entirely and prints what CloudFront
# actually returned over the wire — the ground truth the in-app probe
# cannot reach. See, e.g.,
# roll-web/sentry-reports/investigations/2026-05-08-mobile-safari.md

set -u
URL="${1:-}"
ORIGIN="${2:-https://rd2.app.roll.ai}"

if [[ -z "$URL" ]]; then
  echo "Usage: $0 <signed-url> [origin]" >&2
  exit 2
fi

UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1'

section() { printf '\n=== %s ===\n' "$1"; }

section "Target"
echo "URL    : $(echo "$URL" | sed 's/Signature=[^&]*/Signature=<redacted>/; s/Key-Pair-Id=[^&]*/Key-Pair-Id=<redacted>/; s/Policy=[^&]*/Policy=<redacted>/')"
echo "Origin : $ORIGIN"
echo "UA     : iOS Safari 26.3"

# Decode and report Expires query param if present.
EXPIRES=$(printf '%s' "$URL" | grep -oE 'Expires=[0-9]+' | head -1 | cut -d= -f2)
if [[ -n "${EXPIRES:-}" ]]; then
  NOW=$(date +%s)
  DELTA=$((EXPIRES - NOW))
  echo "Expires: $EXPIRES (in ${DELTA}s — $(date -r "$EXPIRES" 2>/dev/null || echo '?'))"
fi

section "1) GET — actual response headers"
curl -sS -D - -o /dev/null \
  -A "$UA" \
  -H "Origin: $ORIGIN" \
  --compressed \
  "$URL" | sed 's/^/  /'

section "2) OPTIONS preflight"
curl -sS -D - -o /dev/null -X OPTIONS \
  -A "$UA" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: range" \
  "$URL" | sed 's/^/  /'

section "3) HEAD with Origin (matches in-app probe)"
curl -sS -D - -o /dev/null -I \
  -A "$UA" \
  -H "Origin: $ORIGIN" \
  --compressed \
  "$URL" | sed 's/^/  /'

section "Interpretation hints"
cat <<'EOF'
  - Look for: access-control-allow-origin, access-control-allow-credentials, vary
  - If GET returns 200 with ACAO matching the origin -> backend CORS is fine
    -> the in-browser failure is iOS Safari abort / network, NOT CORS.
  - If GET returns 2xx but ACAO is missing -> real CORS misconfig.
  - If GET returns 403 -> signed URL expired or perms changed; not CORS.
  - If GET returns 4xx and ACAO is missing on the error response, the browser
    sees the same request as a code-0 "CORS" failure even though the
    underlying problem is the 4xx. CloudFront must be configured to send CORS
    headers on error responses too.
EOF
