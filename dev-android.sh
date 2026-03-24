#!/bin/bash
set -e

# Quick rebuild & deploy to Android phone
# Usage: ./dev-android.sh

echo "=== Building with Vite ==="
npm run build

echo "=== Copying to cordova/www ==="
rm -rf cordova/www/*
mkdir -p cordova/www
cp -R dist/* cordova/www/

echo "=== Building & deploying to device ==="
cd cordova
npx cordova run android --device

echo "=== Done ==="
