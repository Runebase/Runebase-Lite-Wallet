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

# Update version in cordova/package.json
jq --arg new_version "$new_version" '.version = $new_version' cordova/package.json > tmp_cordova_package.json && mv tmp_cordova_package.json cordova/package.json

# Update version in config.xml
sed -i "s/version=\"[0-9.]*\"/version=\"$new_version\"/" cordova/config.xml

# Update android-versionCode in config.xml
android_version_code=$(echo "$new_version" | tr -d .)
sed -i "s/android-versionCode=\"[0-9]*\"/android-versionCode=\"$android_version_code\"/" cordova/config.xml

# Get the updated version
version=$(jq -r .version package.json)

# Bump version in static/manifest (adjust the path as needed)
sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" static/manifest.json

# Clean and prepare directories
yarn clean
mkdir -p dist
rm -rf dist-electron/*
rm -rf cordova/www/*
rm -rf compiled_files/*

# Create a directory for compiled files
compiled_dir="compiled_files"
mkdir -p "$compiled_dir"

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

# Change to the dist directory
cd dist

# Create the zip file for the Chrome extension
zip -r "../$compiled_dir/Runebase-Chrome-Wallet-$version.zip" *

# Return to the original directory
cd ..

# Copy relevant compiled files to the new directory with renamed files
cp -r cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk "$compiled_dir/Runebase-Lite-Wallet-v$version-debug.apk"
cp -r cordova/platforms/android/app/build/outputs/bundle/release/app-release.aab "$compiled_dir/Runebase-Lite-Wallet-v$version-release.aab"
cp -r dist-electron/*.AppImage "$compiled_dir"
cp -r dist-electron/*.exe "$compiled_dir"
cp -r dist-electron/*.deb "$compiled_dir"
cp -r dist-electron/latest.yml "$compiled_dir"
cp -r dist-electron/latest-linux.yml "$compiled_dir"


# Display a message indicating where the compiled files are located
echo "Compiled files are in the '$compiled_dir' directory."
