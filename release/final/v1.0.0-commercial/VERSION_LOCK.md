# Version Lock

The commercial release is locked as:

`OmniStore ERP 1.0.0-commercial`

- Freeze date: 2026-07-02
- Release status: `READY_FOR_CUSTOMER_001`
- Regression baseline: 1980 passed checks
- Service Worker cache: `v41-go-live`
- Production Mode: OFF

Any change to a checksummed file invalidates this freeze and requires:

1. A new semantic version or documented rebuild identifier.
2. Full regression execution.
3. New checksums and inventory.
4. A new freeze report.

Do not replace secrets, enable Production Mode, or deploy a customer inside the frozen master snapshot.

