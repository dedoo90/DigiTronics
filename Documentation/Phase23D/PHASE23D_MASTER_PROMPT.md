# Phase 23D — Master Prompt: HTML Consolidation

**Repository:** E:\Projects\ESO
**Baseline:** phase23c-docs (tag phase23c-docs)
**Date:** 2026-08-05
**Status:** Documentation Only — No Code Changes

---

## Context

Phase 23C (Architecture & Technical Debt Assessment) is **100% complete**. All architecture documentation, technical debt inventory, security architecture, and design decision records are complete and approved.

Phase 23D is an **Implementation Phase**. Code changes are allowed. HTML consolidation is the primary objective.

Phase 23D focuses on:
- Merging two HTML files into a single canonical entry point
- Updating all references (manifest.json, Service Worker, docker-compose.yml)
- Validating the consolidated result
- Cleaning up backup files and repository clutter

---

## What to Do

### 23D-1: Pre-Merge Preparation

1. Create git tag `phase23d-pre-merge`
2. Run full test suite to establish baseline
3. Document unique features in DigiTronics_v5.html

### 23D-2: Feature Merge

4. Merge unique CSS from DigiTronics_v5.html
5. Merge unique JavaScript from DigiTronics_v5.html
6. Merge unique HTML from DigiTronics_v5.html
7. Validate merge (no feature loss)

### 23D-3: Reference Update

8. Update manifest.json (start_url → index.html)
9. Update sw.js (cache only index.html)
10. Update docker-compose.yml (remove DigiTronics_v5.html)
11. Update refreshPwaCache() (HTML reference)

### 23D-4: Validation

12. Run all E2E tests (80/80)
13. Run all backend tests (253/253)
14. Test PWA installation
15. Test Service Worker update
16. Test all CRUD operations
17. Verify no console errors

### 23D-5: Cleanup

18. Archive DigiTronics_v5.html
19. Remove .bak files from repository
20. Add test-results/ to .gitignore
21. Force Service Worker update

---

## What NOT to Do

- Do NOT modify backend code
- Do NOT add new features
- Do NOT refactor code
- Do NOT change business logic
- Do NOT modify security settings (Phase 23F)
- Do NOT optimize performance (Phase 23F)
- Do NOT skip validation steps
- Do NOT merge without git tag

---

## Validation

After each task:
- Verify all tests pass
- Verify no regression
- Verify no console errors
- Verify PWA functionality

---

## Completion Criteria

- [ ] Single HTML file (`index.html`) as canonical entry point
- [ ] `manifest.json` references `index.html`
- [ ] Service Worker caches only `index.html`
- [ ] All E2E tests pass (80/80)
- [ ] All backend tests pass (253/253)
- [ ] No regression in functionality
- [ ] Backup files archived
- [ ] `.bak` files removed

---

## References

- Investigation Report: `E:\Projects\ESO\Documentation\Phase23D\PHASE23D_INVESTIGATION_REPORT.md`
- Roadmap: `E:\Projects\ESO\Documentation\Phase23D\PHASE23D_ROADMAP.md`
- Checklist: `E:\Projects\ESO\Documentation\Phase23D\PHASE23D_CHECKLIST.md`
- Phase 23C Tag: phase23c-docs
- Phase 23C Architecture: `E:\Projects\ESO\Documentation\Phase23C\ARCHITECTURE_INDEX.md`
- Phase 23C ADRs: `E:\Projects\ESO\Documentation\Phase23C\ARCHITECTURE_DECISIONS.md`

---

*Master prompt generated: 2026-08-05*
*Tag: phase23c-docs*
*Commit: HEAD*
