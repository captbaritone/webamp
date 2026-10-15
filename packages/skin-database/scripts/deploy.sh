#!/usr/bin/env bash
#
# Deploy skin-database on the production server.
#
# Run it on the server, or from anywhere with:
#
#   ssh captbaritone@jordaneldredge.com 'bash ~/projects/webamp/packages/skin-database/scripts/deploy.sh'
#
# Both skin-database-blue (api.webamp.org, port 3001) and skin-database-green
# (skins.webamp.org, port 3002) run `next start` from this directory, so they
# serve the same .next build. To keep them serving the old build while the new
# one compiles, we build into .next-build, then swap it in and restart both.
# If the build fails nothing live has changed.
#
# The server has little memory to spare (a build takes it down to a few hundred
# MB free), so the build's heap is capped: if it runs short the build fails on
# its own rather than the kernel killing a live server.
#
# The previous build is kept as .next-previous. To go back to it:
#
#   bash scripts/deploy.sh --rollback
#
# Which UI the museum serves (see middleware.ts) is switched without a build:
#
#   bash scripts/deploy.sh --classic   # the original museum
#   bash scripts/deploy.sh --new       # the new grid and feed (the default)

set -euo pipefail

SERVICES=(skin-database-blue skin-database-green)
PORTS=(3001 3002)
BUILD_HEAP_MB=1536

cd "$(dirname "$0")/.."

log() {
  echo "→ $*"
}

# Use the same Node as the services, from their systemd unit, rather than
# whatever this shell has (non-interactive ssh doesn't load nvm).
SERVICE_PATH=$(systemctl show "${SERVICES[0]}" -p Environment --value |
  tr ' ' '\n' | sed -n 's/^"\{0,1\}PATH=//p' | tr -d '"')
if [[ -n "$SERVICE_PATH" ]]; then
  export PATH="$SERVICE_PATH"
fi

restart_and_check() {
  log "Restarting ${SERVICES[*]}..."
  sudo -n systemctl restart "${SERVICES[@]}"
  for port in "${PORTS[@]}"; do
    local ok=""
    for _ in $(seq 1 30); do
      # -L: a page that moves (and redirects) shouldn't fail the check.
      if [[ $(curl -sL -o /dev/null -w "%{http_code}" "http://localhost:$port/about") == 200 ]]; then
        ok=1
        break
      fi
      sleep 1
    done
    if [[ -z "$ok" ]]; then
      echo "✗ Nothing healthy on port $port after 30s"
      return 1
    fi
    log "Port $port is up"
  done
}

swap_back() {
  mv .next .next-failed
  mv .next-previous .next
  rm -rf .next-failed
}

# Everything runs from main, called on the last line, so bash has read the
# whole script before the `git pull` below can change it on disk.
main() {
  if [[ "${1:-}" == "--classic" || "${1:-}" == "--new" ]]; then
    local ui="${1#--}"
    # Next loads this file at startup; MUSEUM_UI is read per request.
    printf 'MUSEUM_UI=%s\n' "$ui" > .env.production.local
    restart_and_check
    log "The museum now serves the $ui UI"
    exit 0
  fi

  if [[ "${1:-}" == "--rollback" ]]; then
    if [[ ! -d .next-previous ]]; then
      echo "✗ No .next-previous to roll back to"
      exit 1
    fi
    log "Rolling back to the previous build..."
    swap_back
    restart_and_check
    log "Rolled back to build $(cat .next/BUILD_ID)"
    exit 0
  fi

  log "Node $(node -v), pnpm $(pnpm -v)"

  if [[ -n $(git status --porcelain --untracked-files=no) ]]; then
    echo "✗ The checkout has uncommitted changes; not deploying over them"
    git status --short --untracked-files=no
    exit 1
  fi

  log "Pulling master..."
  git pull --rebase origin master
  log "At $(git log --oneline -1)"

  log "Installing dependencies..."
  (cd ../.. && pnpm install --frozen-lockfile)

  # The museum uses this repo's Webamp, which is only usable once built. If
  # it isn't, the build quietly falls back to a published copy of Webamp
  # elsewhere in node_modules, so build the bundles the museum imports.
  log "Building Webamp..."
  (cd ../webamp && NODE_OPTIONS="--max-old-space-size=$BUILD_HEAP_MB" \
    node ./scripts/rollup.mjs webamp.bundle.min.mjs webamp.bundle.min.js)

  log "Building into .next-build (the live sites keep serving .next)..."
  rm -rf .next-build
  NEXT_DIST_DIR=.next-build NODE_OPTIONS="--max-old-space-size=$BUILD_HEAP_MB" \
    pnpm run build
  # next build edits tsconfig.json to include the build directory's generated
  # types if it isn't already there. Put it back so the next deploy's pull
  # isn't blocked by a dirty checkout.
  git checkout -- tsconfig.json
  if [[ ! -f .next-build/BUILD_ID ]]; then
    echo "✗ The build didn't produce .next-build/BUILD_ID; nothing was changed"
    exit 1
  fi

  log "Swapping in build $(cat .next-build/BUILD_ID)..."
  rm -rf .next-previous
  mv .next .next-previous
  mv .next-build .next

  if ! restart_and_check; then
    echo "✗ The new build didn't come up. Rolling back..."
    swap_back
    restart_and_check
    echo "✗ Rolled back to build $(cat .next/BUILD_ID). The failed build is gone;"
    echo "  check the logs with: sudo journalctl -u ${SERVICES[0]} -n 100"
    exit 1
  fi

  log "Deployed build $(cat .next/BUILD_ID)"
  log "To undo: bash scripts/deploy.sh --rollback"
}

main "$@"
