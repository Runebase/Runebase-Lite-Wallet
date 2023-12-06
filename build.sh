#!/bin/bash

yarn clean
mkdir dist
rm -rf dist-electron/*
rm -rf cordova/www/*
./scripts/create-empty-thunk.sh
webpack --progress --config webpack.prod.config.js
cp -R dist/* cordova/www
cd cordova
cordova build android
cordova build android --release
cd ..
electron-builder --win --linux -c electron-builder-config.js