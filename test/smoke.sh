set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

failures=0

# check <expected-status> <path>
check() {
  local expected="$1"
  local path="$2"
  local body status

  # Capture the body and the status code in one request.
  body="$(curl -sS -w '\n%{http_code}' "${BASE_URL}${path}")"
  status="$(printf '%s' "$body" | tail -n1)"
  body="$(printf '%s' "$body" | sed '$d')"

  if [[ "$status" == "$expected" ]]; then
    printf 'ok   %-28s %s  %s\n' "$path" "$status" "$body"
  else
    printf 'FAIL %-28s got %s, want %s  %s\n' "$path" "$status" "$expected" "$body"
    failures=$((failures + 1))
  fi
}

echo "Smoke testing ${BASE_URL}"

check 200 "/"
check 200 "/convert?lbs=0"
check 200 "/convert?lbs=150" 
check 200 "/convert?lbs=0.1" 
check 400 "/convert"
check 400 "/convert?lbs=abc"
check 422 "/convert?lbs=-5"
check 422 "/convert?lbs=Infinity"
check 200 "/health" '"status":"ok"'
check 200 "/stats" '"conversions":'

if (( failures > 0 )); then
  echo "${failures} check(s) failed."
  exit 1
fi

echo "All checks passed."