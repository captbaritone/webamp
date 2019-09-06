#!/bin/sh
# Build the package
set -e

# Compile the libtimidity C codebase to JavaScript with emscripten
BUILD_FLAGS="-s STRICT=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME=LibTimidity -s EXPORTED_FUNCTIONS=@tools/exports.json -s EXTRA_EXPORTED_RUNTIME_METHODS=@tools/exports-runtime.json"

# Maximize optimization options for smallest file size
OPTIMIZE_FLAGS="-Oz -s ENVIRONMENT=web" # PRODUCTION
# OPTIMIZE_FLAGS="-g4 -DTIMIDITY_DEBUG" # DEBUG

emcc -o libtimidity.js $OPTIMIZE_FLAGS $BUILD_FLAGS libtimidity/src/*.c

# Include the freepats config in the published package so `brfs` can inline it
cp node_modules/freepats/freepats.cfg freepats.cfg
