---
name: release
description: Cut a new webamp npm release
---

# Release webamp to npm

## Steps
1. Bump `version` in `packages/webamp/package.json` and `Webamp.VERSION` in `packages/webamp/js/webampLazy.tsx` to match the new version
2. Commit and push the version bump
3. Create and push a git tag on that commit: `git tag v{X.Y.Z} && git push origin v{X.Y.Z}`
4. CI (`.github/workflows/ci.yml`) builds, tests, publishes
5. Monitor: `gh run list --limit 3` then `gh run watch <id> --exit-status`
6. Verify: `npm view webamp versions --json | tail -5`

## How it works
- Don't bump ani-cursor or winamp-eqf versions — CI sets those from the git tag
- All 3 packages (webamp, ani-cursor, winamp-eqf) get the same version
- Tagged releases publish to `latest`; master pushes publish `0.0.0-next-{sha}` to `next`
- Uses npm provenance (OIDC)

## Post-release
- Update changelog: move "Unreleased" items into a new versioned section, then comment out the Unreleased section (`<!-- ... -->`)
- Update docs (features reference version numbers — replace "unreleased" with the new version)