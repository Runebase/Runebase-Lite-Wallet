#!/bin/bash

set -e

# Check if required commands are available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

for cmd in yarn jq zip cordova electron-builder webpack; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd not found. Please install it before running this script."
        exit 1
    fi
done

# Define version for chrome extension zip
version=$(jq -r .version package.json)

# Clean and prepare directories
yarn clean
mkdir -p dist
rm -rf dist-electron/*
rm -rf cordova/www/*
rm -rf compiled_files/*

# Run the script to create an empty thunk (assuming it doesn't need special permissions)
./scripts/create-empty-thunk.sh

# Build the application with Webpack
webpack --progress --config webpack.prod.config.js

# Copy the build output to the Cordova www directory
cp -R dist/* cordova/www

# Change to the Cordova directory and build the Android app
cd cordova
cordova build android
cordova build android --release --buildConfig=build.json
cd ..

# Build the Electron app for Windows and Linux
electron-builder --win --linux -c electron-builder-config.js

# Create the zip file for the Chrome extension
zip -r "Runebase-Lite-Wallet-$version.zip" dist/*

# Create a directory for compiled files
compiled_dir="compiled_files"
mkdir -p "$compiled_dir"

# Copy relevant compiled files to the new directory with renamed files
cp -r cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk "$compiled_dir/Runebase-Lite-Wallet-v$version-debug.apk"
cp -r cordova/platforms/android/app/build/outputs/bundle/release/app-release.aab "$compiled_dir/Runebase-Lite-Wallet-v$version-release.aab"
cp -r dist-electron/*.AppImage "$compiled_dir"
cp -r dist-electron/*.exe "$compiled_dir"
cp "Runebase-Lite-Wallet-$version.zip" "$compiled_dir"

# Display a message indicating where the compiled files are located
echo "Compiled files are in the '$compiled_dir' directory."