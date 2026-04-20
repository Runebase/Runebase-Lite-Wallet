#!/bin/bash

set -e

# Check if required commands are available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

for cmd in jq zip npx electron-builder; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd not found. Please install it before running this script."
        exit 1
    fi
done

# Determine the release type (patch, minor, major)
release_type=${1:-patch}  # Default to 'patch' if no argument is provided

# Read the current version from main package.json
current_version=$(jq -r .version package.json)

# Increment version based on the release type
if [ "$release_type" = "patch" ]; then
    new_version=$(echo "$current_version" | awk -F. '{print $1 "." $2 "." $3 + 1}')
elif [ "$release_type" = "minor" ]; then
    new_version=$(echo "$current_version" | awk -F. '{print $1 "." $2 + 1 ".0"}')
elif [ "$release_type" = "major" ]; then
    new_version=$(echo "$current_version" | awk -F. '{print $1 + 1 ".0.0"}')
else
    echo "Error: Invalid release type. Please use 'patch', 'minor', or 'major'."
    exit 1
fi

# Update version in main package.json
jq --arg new_version "$new_version" '.version = $new_version' package.json > tmp_package.json && mv tmp_package.json package.json

# Get the updated version
version=$(jq -r .version package.json)

# Bump version in static/manifest (Chrome extension)
sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" static/manifest.json

# Clean and prepare directories
npm run clean
rm -rf dist-electron/*
rm -rf compiled_files/*

# Create a directory for compiled files
compiled_dir="compiled_files"
mkdir -p "$compiled_dir"

# ── Chrome Extension build ──
npx vite build --config vite.config.extension.ts

# Create the zip file for the Chrome extension
cd dist
zip -r "../$compiled_dir/Runebase-Chrome-Wallet-$version.zip" *
cd ..

# ── Android (Capacitor) build ──
npx vite build --config vite.config.capacitor.ts
npx cap sync android
cd android
./gradlew assembleDebug
./gradlew assembleRelease
cd ..

cp -r android/app/build/outputs/apk/debug/app-debug.apk "$compiled_dir/Runebase-Lite-Wallet-v$version-debug.apk"
cp -r android/app/build/outputs/apk/release/app-release-unsigned.apk "$compiled_dir/Runebase-Lite-Wallet-v$version-release.apk" 2>/dev/null || true
cp -r android/app/build/outputs/bundle/release/app-release.aab "$compiled_dir/Runebase-Lite-Wallet-v$version-release.aab" 2>/dev/null || true

# ── Electron build ──
# Rebuild extension dist for Electron (it uses the extension config)
npx vite build --config vite.config.extension.ts
electron-builder --win --linux -c electron-builder-config.js

cp -r dist-electron/*.AppImage "$compiled_dir" 2>/dev/null || true
cp -r dist-electron/*.exe "$compiled_dir" 2>/dev/null || true
cp -r dist-electron/*.deb "$compiled_dir" 2>/dev/null || true
cp -r dist-electron/latest.yml "$compiled_dir" 2>/dev/null || true
cp -r dist-electron/latest-linux.yml "$compiled_dir" 2>/dev/null || true

# Display a message indicating where the compiled files are located
echo "Compiled files are in the '$compiled_dir' directory."
