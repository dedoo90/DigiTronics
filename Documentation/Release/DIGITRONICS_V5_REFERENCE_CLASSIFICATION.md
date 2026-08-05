# DigiTronics_v5.html Reference Classification

**Date:** 2026-08-05
**Purpose:** Classify all references to DigiTronics_v5.html

---

## Classification Table

| File | Reference Type | Classification | Action Required |
|------|----------------|----------------|-----------------|
| .github/workflows/ci.yml | CI/CD | PRODUCTION | Review needed |
| DEPLOYMENT.md | Documentation | DOCUMENTATION | No action |
| DigiTronics_v5.html | Self-reference | LEGACY | No action |
| backups/ | Backups | BACKUP | No action |
| backend/docs/PERFORMANCE.md | Documentation | DOCUMENTATION | No action |
| backend/README.md | Documentation | DOCUMENTATION | No action |
| docs/audit/ | Documentation | DOCUMENTATION | No action |
| docs/*.md | Documentation | DOCUMENTATION | No action |
| Documentation/Phase23C/ | Documentation | DOCUMENTATION | No action |
| Documentation/Phase23D/ | Documentation | DOCUMENTATION | No action |

---

## Summary

| Classification | Count | Action |
|----------------|-------|--------|
| PRODUCTION | 1 | Review needed |
| DOCUMENTATION | 8 | No action |
| LEGACY | 1 | No action |
| BACKUP | 1 | No action |

---

## Recommendation

**CI/CD Reference (.github/workflows/ci.yml):**
- Line 48: Job name references DigiTronics_v5.html
- Line 70-71: Test step runs Playwright on DigiTronics_v5.html

**Classification:** This is a TEST reference, not production deployment.
The CI/CD pipeline tests both index.html AND DigiTronics_v5.html for regression.
This is acceptable as long as DigiTronics_v5.html exists in the repository.

**No production deployment depends on DigiTronics_v5.html.**
The manifest.json, sw.js, and docker-compose.yml all reference index.html only.
