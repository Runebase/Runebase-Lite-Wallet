package io.runebase.runebaselitewallet;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        /*
         * ============================================================
         * CORDOVA DATA MIGRATION (temporary — remove after 2027-07-01)
         *
         * Copies IndexedDB data from the old Cordova file:// origin to
         * Capacitor's https://localhost origin so existing users don't
         * lose their imported wallets after the app update.
         *
         * Runs once (first launch post-update), then sets a flag and
         * never runs again. Safe to remove this block + the
         * CordovaDataMigration class after the removal date.
         * ============================================================
         */
        CordovaDataMigration.migrateIfNeeded(this);

        super.onCreate(savedInstanceState);
    }
}
