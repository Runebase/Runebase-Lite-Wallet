#!/bin/bash
set -e

# Quick rebuild & deploy to Android phone
# Usage: ./dev-android.sh

echo "=== Building webpack bundle ==="
npm run clean && mkdir dist
./scripts/create-empty-thunk.sh
npx webpack --progress --config webpack.prod.config.js

echo "=== Copying to cordova/www ==="
rm -rf cordova/www/*
mkdir -p cordova/www
cp -R dist/* cordova/www/

echo "=== Building & deploying to device ==="
cd cordova
npx cordova run android --device

echo "=== Done ==="
