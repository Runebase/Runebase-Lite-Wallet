#!/bin/bash

yarn clean
rm -rf dist-electron/*
rm -rf cordova/www/*
webpack --config webpack.prod.config.js
./scripts/create-empty-thunk.sh
cp -R dist/* cordova/www
cd cordova
cordova build android
cordova build android --release
cd ..
electron-builder --win --linux -c electron-builder-config.js