#!/usr/bin/env bash

# Bail on errors
set -e

echo "Reverting..."

cd /var/www/jordaneldredge.com/

echo "Rolling back to $PREVIOUS"
ln -snf `pwd`repos/previous public_html/projects/winamp2-js

echo "Done!"
