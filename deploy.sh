#!/bin/bash
pnpm --filter ani-cursor build
pnpm --filter webamp build
pnpm --filter webamp build-library
pnpm --filter webamp-modern build
mv packages/webamp-modern/build packages/webamp/dist/demo-site/modern