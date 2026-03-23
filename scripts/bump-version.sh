#!/bin/bash

set -e

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required. Install with: sudo apt install jq"
    exit 1
fi

# Determine the release type (patch, minor, major)
release_type=${1:-patch}

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
    echo "Error: Invalid release type. Use 'patch', 'minor', or 'major'."
    exit 1
fi

echo "Bumping version: $current_version -> $new_version ($release_type)"

# Update version in main package.json
jq --arg v "$new_version" '.version = $v' package.json > tmp.json && mv tmp.json package.json

# Update version in cordova/package.json
jq --arg v "$new_version" '.version = $v' cordova/package.json > tmp.json && mv tmp.json cordova/package.json

# Update version in config.xml
sed -i "s/version=\"[0-9.]*\"/version=\"$new_version\"/" cordova/config.xml

# Update android-versionCode in config.xml
android_version_code=$(echo "$new_version" | tr -d .)
sed -i "s/android-versionCode=\"[0-9]*\"/android-versionCode=\"$android_version_code\"/" cordova/config.xml

# Update version in static/manifest.json
sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" static/manifest.json

# Commit, tag, and push
git add package.json cordova/package.json cordova/config.xml static/manifest.json
git commit -m "release: v$new_version"
git tag "v$new_version"
git push
git push --tags

echo ""
echo "Released v$new_version"
echo "GitHub Actions will now build all platforms and create the release."
