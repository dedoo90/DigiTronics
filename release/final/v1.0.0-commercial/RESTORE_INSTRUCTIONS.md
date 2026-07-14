# Restore Instructions

## Verify the frozen release

1. Keep Production Mode OFF.
2. Compare the 36 protected files against `CHECKSUMS.json` using SHA-256.
3. Confirm `DigiTronics_v5.html`, `sw.js`, and `manifest.json` exist.
4. Confirm the three directories `release/v1.0`, `customerRollout/marioFely`, and `services/goLive` exist.
5. Confirm `sw.js` contains cache version `v41-go-live`.
6. Run all 37 test suites and require 1980 passing checks.

## Restore

Restore the checksummed files from a trusted copy of this frozen release to the same relative paths under `E:\Projects\ESO`. Do not restore into a customer-copy directory.

After restoration:

1. Clear only the browser cache for the application if the old Service Worker persists.
2. Reload OmniStore ERP.
3. Verify Production Mode remains OFF.
4. Run the regression suite again.

No SQL, Supabase action, or database rollback is part of this restore procedure.

