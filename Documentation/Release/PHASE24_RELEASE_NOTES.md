# Phase 24 — Release Notes

**Version:** phase24-release
**Date:** 2026-08-06
**Status:** APPROVED WITH MINOR RECOMMENDATIONS

## Highlights

- **OAuth2 SSO** — Google + GitHub sign-in via Passport, session-based, role mapping to ADR-001 roles.
- **MFA (TOTP)** — time-based one-time passwords via speakeasy + QR provisioning; login requires second factor when enabled.
- **OpenAPI / Swagger** — full API specification (`/api-docs`, `/api-docs.json`), validated contract, OpenAPI YAML in `Documentation/Phase24/PHASE24_OPENAPI_SPECIFICATION.yaml`.
- **API Keys** — `dgv2_live_`-prefixed keys, SHA-256 hashed at rest, scoped, per-key rate limiting, enable/revoke lifecycle.
- **Audit Logging + Request Correlation** — every mutating request captured with `X-Request-Id`, sanitized changes, queryable `/api/v1/audit-log`.
- **Event Bus + Webhooks + Metrics + ETag** — in-process pub/sub, HMAC-SHA256 signed webhook delivery with retries, Prometheus-compatible `/api/v1/metrics`, conditional GET via ETag.
- **Enterprise Runtime** — persisted job queue with retries/backoff, interval scheduler, deep health checks, deduplicated error tracker with open/acknowledged/resolved workflow.
- **Stability** — idempotent graceful shutdown fixing the `process.exit` double-call; 447/447 tests across 35 suites.

## Backward Compatibility

- All existing routes, auth flows, and JSON persistence unchanged.
- New capabilities are additive and default-inactive where applicable.
- ADR-001 hybrid role model and ADR-002 multi-tenant model documented; no breaking role changes.

## Known Items

1. Intermittent test failure observed once in 27 runs during certification (identity uncaptured) — monitor in CI.
2. Release tag `phase24-release` to be created after committing the working tree.

## Ops Notes

- Set `JWT_SECRET` (≥32 chars), `JWT_REFRESH_SECRET`, `SESSION_SECRET` in production (`scripts/checkEnv.js` validates).
- Deployment: single-instance PM2 (`ecosystem.config.js`) or Docker (`docker-compose.yml`).
- See `docs/OPS`, `OPERATIONS.md`, `PRODUCTION_CHECKLIST.md`.