#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var platformWwwDir = 'platforms/android/platform_www'; // Update this with your target platform

// Function to copy files from source to destination
function copyFileSync(source, target) {
    fs.writeFileSync(target, fs.readFileSync(source));
}

// Function to copy a directory recursively
function copyFolderRecursiveSync(source, target) {
    var files = fs.readdirSync(source);

    // Ensure the target directory exists
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    // Copy
    files.forEach(function (file) {
        var curSource = path.join(source, file);
        var targetFile = path.join(target, file);

        if (fs.lstatSync(curSource).isDirectory()) {
            if (file !== 'plugins') {  // Skip the 'plugins' directory
                copyFolderRecursiveSync(curSource, targetFile);
            }
        } else {
            copyFileSync(curSource, targetFile);
        }
    });
}

// Copy platform-specific files to the www directory
copyFolderRecursiveSync(platformWwwDir, 'www');
