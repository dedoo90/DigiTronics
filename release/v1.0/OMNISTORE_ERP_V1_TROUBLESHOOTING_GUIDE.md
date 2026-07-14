# Troubleshooting Guide

- Connection failure: verify URL, anon key, origin, project ref, and Edge health.
- Authorization failure: verify authenticated `erp_owner`.
- Execution disabled: verify server gate and explicit Production Mode status.
- Validation failure: resolve all blocking checks before confirmation.
- Partial failure: stop, inspect audit, and use the operation-specific rollback point.
- UI cache issue: deploy the latest service-worker version and refresh the application shell.
