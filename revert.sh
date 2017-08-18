#!/usr/bin/env bash

# Bail on errors
set -e

echo "Reverting..."

cd /var/www/jordaneldredge.com/

PREVIOUS=$(readlink -f repos/previous)
echo "Rolling back to $PREVIOUS"
ln -snf $PREVIOUS public_html/projects/winamp2-js

echo "Done!"
