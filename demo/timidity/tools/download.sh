#!/bin/sh
# Download the latest libtimidity release from SourceForge
set -e

rm -rf libtimidity
rm -rf tmp
mkdir tmp

curl -L https://sourceforge.net/projects/libtimidity/files/latest/download -o tmp/libtimidity.tar.gz

# Extract e.g. libtimidity.tar.gz to libtimidity-0.2.5
tar xf tmp/libtimidity.tar.gz

# Rename e.g. libtimidity-0.2.5 to libtimidity
mv libtimidity-* libtimidity

rm -rf tmp
