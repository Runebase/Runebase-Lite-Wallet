#!/bin/bash

yarn clean
webpack --config webpack.prod.config.js
./scripts/create-empty-thunk.sh
rm -rf cordova/www/*
cp -R dist/* cordova/www
cd cordova
cordova build android