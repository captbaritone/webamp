# Skin Archive Tools

**Note:** My goal is to merge this into the `skin-database` package.

A collection of scripts for managing the Internet Archive's collection of Winamp Skins.

It works as a data pipeline. The phases are:

## 1. Collect Skins

I collect skins into a single directory on my computer. There is no real organizational strategy within this directory. It's deeply nested and there are many duplicates, as it consists of multiple collections, small and large, from multiple sources.

We will also extrack skins for "packs" which are zip files containing multiple skins.

## 2. Skins Are Deduped

A script creates a single flat directory that contains each skin named only by its md5 hash.

## 3. Screenshots Are Taken

Yup.

## 4. Skins Are Synced to the Internet Archive

TODO

## Usage

```bash
yarn start
```

Note: This will probably break the first time it's run, since it requires a directory structure that is currently not checked in due to `.gitignore`.

Something like:

```
$ tree assets -d -L 1
assets
├── md5Invalids
├── md5Packs
├── md5Screenshots
├── md5Skins
└── skins
```
