#!/bin/bash
set -euo pipefail

# Switch to Node 22
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 22

# Install dependencies
yarn install --frozen-lockfile

# Build the site
yarn run build

# Reload processes via PM2
pm2 reload ecosystem.config.js