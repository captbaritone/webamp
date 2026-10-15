#!/usr/bin/env bash
#
# Checks that every kind of museum URL people have bookmarked or shared still
# works, and which UI serves it (see middleware.ts).
#
#   bash scripts/check-routes.sh new [base-url]       # expect the new UI
#   bash scripts/check-routes.sh classic [base-url]   # expect the classic UI
#
# base-url defaults to https://skins.webamp.org. Exits non-zero on any
# mismatch.

set -uo pipefail

MODE="${1:?usage: check-routes.sh new|classic [base-url]}"
BASE="${2:-https://skins.webamp.org}"

# A real skin, and its file name as the sitemap writes it.
MD5=7b9df7892503371430aaf99ea7a172c0
FILE=Unreal_Skin_Of_The_Same_Game.wsz

failures=0

# What a response is: "new" or "classic" for a page from that UI,
# "308 <target>" for a redirect, otherwise the status code.
describe() {
  local path="$1" method="${2:-GET}"
  local headers body status location
  body=$(mktemp)
  headers=$(curl -s -X "$method" -o "$body" -D - --max-time 30 "$BASE$path")
  status=$(head -1 <<<"$headers" | awk '{print $2}')
  location=$(grep -i '^location:' <<<"$headers" | tr -d '\r' | awk '{print $2}')
  if [[ "$status" == 30* ]]; then
    echo "$status ${location#"$BASE"}"
  elif [[ "$status" == 200 ]] && grep -q 'data-hamburger-toggle' "$body"; then
    echo "new"
  elif [[ "$status" == 200 ]] && grep -qi '<html' "$body"; then
    echo "classic"
  else
    echo "$status"
  fi
  rm -f "$body"
}

# check PATH EXPECTED_WITH_NEW_UI EXPECTED_WITH_CLASSIC_UI [METHOD]
check() {
  local path="$1" expected
  if [[ "$MODE" == new ]]; then expected="$2"; else expected="$3"; fi
  local actual
  actual=$(describe "$path" "${4:-GET}")
  if [[ "$expected" == any || "$actual" == "$expected" ]]; then
    printf '  ok    %-60s %s\n' "$path" "$actual"
  else
    printf '  FAIL  %-60s %s (expected %s)\n' "$path" "$actual" "$expected"
    failures=$((failures + 1))
  fi
}

echo "Checking $BASE (expecting the $MODE UI)"

# The museum's own URLs.
check "/" new classic
check "/?query=zelda" new classic
check "/feed" new 404
check "/skin/$MD5" new classic
check "/skin/$MD5/$FILE" new classic
check "/skin/$MD5/$FILE/null" new any
check "/about" new classic
check "/feedback" new classic

# Always the classic UI.
check "/upload" classic classic
check "/skin/$MD5/debug" classic classic

# Redirects, in either mode.
check "/index.html" "308 /" "308 /"
check "/scroll" "308 /" "308 /"
check "/scroll?q=zelda" "308 /?query=zelda" "308 /?query=zelda"
check "/scroll/skin" "308 /feed" "308 /feed"
check "/scroll/skin/$MD5" "308 /skin/$MD5" "308 /skin/$MD5"
check "/scroll/about" "308 /about" "308 /about"
check "/scroll/feedback" "308 /feedback" "308 /feedback"

# Unaffected.
check "/table" any any
check "/sitemap/0.xml" 200 200
check "/scroll/events" 400 400 POST

if [[ $failures -gt 0 ]]; then
  echo "$failures check(s) failed"
  exit 1
fi
echo "All checks passed"
