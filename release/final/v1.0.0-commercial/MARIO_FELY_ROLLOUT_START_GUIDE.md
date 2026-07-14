# Mario Fely Rollout Start Guide

Customer #001 is prepared but not created.

## Before starting

1. Work from the master project `E:\Projects\ESO`.
2. Verify all release checksums.
3. Confirm 1980 tests pass.
4. Confirm Production Mode is OFF.
5. Review `customerRollout/marioFely/mario-fely-production-runbook.md`.
6. Review `customerRollout/marioFely/mario-fely-rollback-plan.md`.

## Controlled rollout sequence

1. Open Go Live Center.
2. Review Customer #001 profile and tenant ID `mario_fely`.
3. Configure only public Supabase values.
4. Keep `service_role` in server-side Edge Function secrets.
5. Explicitly test the connection as an authenticated Owner.
6. Preview the database installation.
7. Preview Mario Fely provisioning.
8. Create and verify a rollback point.
9. Enable Production Mode only through the Phase 34 secure gateway.
10. Confirm the exact operation and customer.
11. Execute one controlled server-side operation.
12. Verify tenant isolation, workspace health, roles, settings, and login URL.
13. Disable Production Mode immediately after verification.

This freeze does not authorize automatic deployment. Never copy secrets into HTML, JavaScript, JSON templates, or this guide.

