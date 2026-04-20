#!/bin/bash
set -e

# Quick rebuild & deploy to Android phone
# Usage: ./dev-android.sh

echo "=== Building with Vite (Capacitor config) ==="
npm run build:mobile

echo "=== Syncing Capacitor ==="
npx cap sync android

echo "=== Building & deploying to device ==="
npx cap run android

echo "=== Done ==="
