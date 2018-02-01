#!/usr/bin/env bash

# Bail on errors
set -e

cd /var/www/jordaneldredge.com/

# Generate a new directory to clone to
NEW_CLONE=repos/winamp2-js-`date +%s`

# Do the clone
echo "Cloning Winamp2-js..."
if [ -z "$HASH" ]; then
  echo "Using master"
  git clone --depth=1 git@github.com:captbaritone/winamp2-js.git $NEW_CLONE > /dev/null
else
  git clone git@github.com:captbaritone/winamp2-js.git $NEW_CLONE > /dev/null
  echo "Checking out hash $HASH"
  ( cd $NEW_CLONE && git checkout --quiet $HASH )
fi

echo "Installing Node requirements"
( cd $NEW_CLONE && yarn install )

echo "Run tests"
( cd $NEW_CLONE && yarn run test )

echo "Build the webpack bundle"
( cd $NEW_CLONE && CDN_URL=https://d38dnrh1liu4f5.cloudfront.net/projects/winamp2-js/ yarn run build )

echo "Cleaning up node_modules/ to save space"
( cd $NEW_CLONE && rm -r node_modules )

echo "Cleaning up coverage/ to save space"
( cd $NEW_CLONE && rm -r coverage )

PREVIOUS=$(readlink -f public_html/projects/winamp2-js)

echo "The previous build was: $PREVIOUS"

echo "Creating 'previous' link to enable reverts"
ln -snf $PREVIOUS repos/previous

echo "Linking new Winamp2-js into place"
ln -snf `pwd`/$NEW_CLONE/ public_html/projects/winamp2-js

echo "Done!"
