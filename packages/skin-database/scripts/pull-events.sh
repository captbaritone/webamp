#!/usr/bin/env bash
# Copies production's event log (the new museum UI's user_log_events, and its
# sessions, with their user agents) into events.sqlite3 here (git-ignored,
# like the other databases), for the dev dashboard at /dev/events. Reads
# production without changing it.
#
#   bash scripts/pull-events.sh
set -euo pipefail

cd "$(dirname "$0")/.."
HOST=captbaritone@jordaneldredge.com
REMOTE_DIR='~/projects/webamp/packages/skin-database'
OUT=events.sqlite3
TMP="$OUT.tmp"

rm -f "$TMP"
ssh "$HOST" "cd $REMOTE_DIR && sqlite3 -readonly skins.sqlite3 '.dump user_log_events session' | gzip" |
  gunzip | sqlite3 "$TMP"
mv "$TMP" "$OUT"
echo "→ $(sqlite3 -batch -noheader -list "$OUT" 'SELECT count(*) FROM user_log_events') events in $OUT"
