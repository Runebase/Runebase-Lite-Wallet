# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ── Capacitor ──────────────────────────────────────────────
# Keep the Capacitor bridge and all plugins so the JS ↔ native
# interface works correctly at runtime.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# Keep WebView JS interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Cordova compatibility layer (used by some Capacitor plugins) ──
-keep class org.apache.cordova.** { *; }

# ── App-specific ───────────────────────────────────────────
# Keep the data migration class (called via reflection-like patterns)
-keep class io.runebase.runebaselitewallet.CordovaDataMigration { *; }

# Preserve line numbers for meaningful stack traces
-keepattributes SourceFile,LineNumberTable

# Hide original source file name in stack traces
-renamesourcefileattribute SourceFile
