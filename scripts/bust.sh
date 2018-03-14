#!/bin/bash - 
APP_PATH=`find built | grep "winamp-.*.js$"`
sed -i.bk "s#built\/winamp.js#$APP_PATH#" index.html
