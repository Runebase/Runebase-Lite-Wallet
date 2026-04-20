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
# (Android versionCode/versionName are read from package.json at build time
#  via android/app/build.gradle, so no separate update is needed.)
jq --arg v "$new_version" '.version = $v' package.json > tmp.json && mv tmp.json package.json

# Update version in static/manifest.json (Chrome extension)
sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" static/manifest.json

# Commit, tag, and push
git add package.json static/manifest.json
git commit -m "release: v$new_version"
git tag -a "v$new_version" -m "release: v$new_version"
git push --follow-tags

echo ""
echo "Released v$new_version"
echo "GitHub Actions will now build all platforms and create the release."
