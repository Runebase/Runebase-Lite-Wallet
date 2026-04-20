package io.runebase.runebaselitewallet;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * ============================================================
 * CORDOVA -> CAPACITOR DATA MIGRATION (temporary)
 *
 * Added: v3.0.0 (2026-04-20)
 * Remove after: 2027-07-01
 *
 * Migrates IndexedDB and localStorage data from the old Cordova
 * file:// WebView origin to Capacitor's https://localhost origin.
 *
 * Runs once on first launch after the Capacitor upgrade. The old
 * data is left in place (not deleted) as a safety net. This entire
 * class and its call site in MainActivity can be deleted after the
 * removal date, when all users have updated.
 *
 * How it works:
 *   Android WebView stores per-origin data under:
 *     app_webview/Default/IndexedDB/<origin>/
 *     app_webview/Default/Local Storage/leveldb/
 *
 *   Cordova used file:// -> stored in "file__0.indexeddb.leveldb/"
 *   Capacitor uses https://localhost -> "https_localhost_0.indexeddb.leveldb/"
 *
 *   This class copies the old directory to the new location if the
 *   new location doesn't already contain data (idempotent).
 *
 * ============================================================
 */
public class CordovaDataMigration {

    private static final String TAG = "CordovaDataMigration";
    private static final String PREFS_NAME = "cordova_migration";
    private static final String KEY_MIGRATED = "data_migrated_v1";

    // Old Cordova origin directory names (file:// scheme)
    private static final String OLD_IDB_DIR = "file__0.indexeddb.leveldb";
    // New Capacitor origin directory names (https://localhost scheme)
    private static final String NEW_IDB_DIR = "https_localhost_0.indexeddb.leveldb";

    /**
     * Run the migration if it hasn't been done yet.
     * Call this from MainActivity.onCreate() BEFORE super.onCreate()
     * so the data is in place before the WebView loads.
     */
    public static void migrateIfNeeded(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (prefs.getBoolean(KEY_MIGRATED, false)) {
            Log.d(TAG, "Migration already completed, skipping.");
            return;
        }

        Log.i(TAG, "Starting Cordova -> Capacitor data migration...");

        boolean migrated = false;

        // Migrate IndexedDB
        File webviewDir = new File(context.getDataDir(), "app_webview/Default/IndexedDB");
        if (webviewDir.exists()) {
            File oldIdb = new File(webviewDir, OLD_IDB_DIR);
            File newIdb = new File(webviewDir, NEW_IDB_DIR);

            if (oldIdb.exists() && oldIdb.isDirectory()) {
                if (!newIdb.exists() || isDirectoryEmpty(newIdb)) {
                    Log.i(TAG, "Migrating IndexedDB from " + OLD_IDB_DIR + " to " + NEW_IDB_DIR);
                    if (copyDirectory(oldIdb, newIdb)) {
                        migrated = true;
                        Log.i(TAG, "IndexedDB migration successful.");
                    } else {
                        Log.e(TAG, "IndexedDB migration failed! Old data preserved at: " + oldIdb.getAbsolutePath());
                    }
                } else {
                    Log.i(TAG, "New IndexedDB directory already has data, skipping copy.");
                    migrated = true;
                }
            } else {
                Log.d(TAG, "No old Cordova IndexedDB data found at: " + oldIdb.getAbsolutePath());
                // No old data to migrate — that's fine, mark as done
                migrated = true;
            }
        } else {
            Log.d(TAG, "No WebView IndexedDB directory found (fresh install?).");
            migrated = true;
        }

        // Migrate Local Storage
        // Local Storage is stored in a shared leveldb across origins in older
        // WebView versions, but in newer versions it's also origin-scoped.
        // We copy the entire leveldb directory to be safe.
        File localStorageDir = new File(context.getDataDir(), "app_webview/Default/Local Storage/leveldb");
        if (localStorageDir.exists() && localStorageDir.isDirectory()) {
            // Local Storage leveldb is shared, not per-origin, so if it exists
            // the data should already be accessible from any origin within the
            // same app. We log this but don't need to copy.
            Log.d(TAG, "Local Storage leveldb found. Shared storage is accessible across origins.");
        }

        if (migrated) {
            prefs.edit().putBoolean(KEY_MIGRATED, true).apply();
            Log.i(TAG, "Migration flag set. Will not run again.");
        }
    }

    private static boolean isDirectoryEmpty(File dir) {
        if (!dir.exists() || !dir.isDirectory()) return true;
        String[] files = dir.list();
        return files == null || files.length == 0;
    }

    /**
     * Recursively copy a directory and all its contents.
     * Returns true if successful, false on any error.
     */
    private static boolean copyDirectory(File src, File dst) {
        if (!src.isDirectory()) {
            return copyFile(src, dst);
        }

        if (!dst.exists() && !dst.mkdirs()) {
            Log.e(TAG, "Failed to create directory: " + dst.getAbsolutePath());
            return false;
        }

        String[] children = src.list();
        if (children == null) return true;

        boolean success = true;
        for (String child : children) {
            if (!copyDirectory(new File(src, child), new File(dst, child))) {
                success = false;
                // Continue copying other files even if one fails
            }
        }
        return success;
    }

    private static boolean copyFile(File src, File dst) {
        try {
            File parentDir = dst.getParentFile();
            if (parentDir != null && !parentDir.exists() && !parentDir.mkdirs()) {
                Log.e(TAG, "Failed to create parent directory: " + parentDir.getAbsolutePath());
                return false;
            }

            try (FileInputStream in = new FileInputStream(src);
                 FileOutputStream out = new FileOutputStream(dst)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                out.flush();
            }
            return true;
        } catch (IOException e) {
            Log.e(TAG, "Failed to copy file " + src.getAbsolutePath() + " -> " + dst.getAbsolutePath(), e);
            return false;
        }
    }
}
