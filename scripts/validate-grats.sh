#!/bin/bash

# Script to validate that Grats generated files are up-to-date
# This ensures that developers have run Grats locally and committed the generated files

set -e

echo "🔍 Validating Grats generated files are up-to-date..."

# Run Grats to regenerate schema files
echo "Running Grats to regenerate schema files..."
npx turbo run grats --filter=skin-database

# Check if the generated files were modified
CHANGES=$(git status --porcelain packages/skin-database/api/graphql/)

if [ -n "$CHANGES" ]; then
    echo "❌ Grats generated files are out of date!"
    echo ""
    echo "The following generated files have changes after running Grats:"
    echo "$CHANGES"
    echo ""
    echo "Please run the following command locally and commit the changes:"
    echo "  npx turbo run grats --filter=skin-database"
    echo ""
    echo "Diff of changes:"
    git diff packages/skin-database/api/graphql/
    exit 1
else
    echo "✅ Grats generated files are up-to-date"
fi
