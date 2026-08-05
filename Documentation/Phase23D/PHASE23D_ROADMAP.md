# Phase 23D — Roadmap: HTML Consolidation

**Repository:** E:\Projects\ESO
**Baseline:** phase23c-docs (tag phase23c-docs)
**Date:** 2026-08-05
**Status:** Documentation Only — No Code Changes

---

## Project State

| Item | Value |
|------|-------|
| Current Stable Tag | phase23c-docs |
| Current HEAD | HEAD |
| Repository State | Stable |
| Implementation Frozen | Phase23D |
| Planning only | Implementation NOT started |

---

## Phase Structure

| Phase | Name | Focus |
|-------|------|-------|
| **23C** | Architecture & Technical Debt Assessment | Architecture, documentation, design decisions |
| **23D** | HTML Consolidation | Merge HTML files, update manifest/SW |
| **23E** | Legacy Cleanup | Deprecate → Archive → Delete |
| **23F** | Performance & Optimization | Benchmark first, then optimize |

---

## Phase 23D — HTML Consolidation

### Objectives

1. Establish `index.html` as the single canonical entry point
2. Merge unique features from `DigiTronics_v5.html` into `index.html`
3. Update all references (manifest.json, Service Worker, docker-compose.yml)
4. Archive or remove `DigiTronics_v5.html`
5. Clean up backup files and repository clutter

### Scope

**Included:**
- HTML file consolidation (merge unique features)
- manifest.json update (start_url → index.html)
- Service Worker update (cache list)
- docker-compose.yml update (remove DigiTronics_v5.html mount)
- refreshPwaCache() update (HTML reference)
- Backup file archival
- .bak file removal
- Validation (E2E tests, manual testing)

**Excluded:**
- Security hardening (Phase 23F)
- Performance optimization (Phase 23F)
- Code refactoring
- Backend changes
- New features

### Dependencies

- Phase 23C architecture documentation — **MET**
- Phase 23C tag (phase23c-docs) — **MET**

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| PWA users have cached old manifest | High | Force SW update on deployment |
| Feature loss during merge | High | Careful diff analysis, feature verification |
| Service Worker cache invalidation | Medium | Update SW cache names, force refresh |
| Rollback complexity | Medium | Git tag before merge, clear rollback procedure |

### Rollback

- Create git tag `phase23d-pre-merge` before merge
- Rollback command: `git revert <merge-commit>` or `git reset --hard phase23d-pre-merge`
- Verify rollback with E2E tests

### Validation

- Run all 80 E2E tests (`verify.js`)
- Run all 253 backend tests
- Test PWA installation
- Test Service Worker update
- Test all CRUD operations
- Test offline mode
- Verify no console errors
- Verify no visual regression

### Completion Criteria

- [ ] Single HTML file (`index.html`) as canonical entry point
- [ ] `manifest.json` references `index.html`
- [ ] Service Worker caches only `index.html`
- [ ] All E2E tests pass (80/80)
- [ ] All backend tests pass (253/253)
- [ ] No regression in functionality
- [ ] Backup files archived
- [ ] `.bak` files removed

### Tasks

#### 23D-1: Pre-Merge Preparation

| # | Task | Justification (Investigation Report) |
|---|------|--------------------------------------|
| 1 | Create git tag `phase23d-pre-merge` | Section 7: Rollback strategy |
| 2 | Run full test suite to establish baseline | Section 6.1: Automated testing |
| 3 | Document unique features in DigiTronics_v5.html | Section 1.2: File drift analysis |

#### 23D-2: Feature Merge

| # | Task | Justification (Investigation Report) |
|---|------|--------------------------------------|
| 4 | Merge unique CSS from DigiTronics_v5.html | Section 1.2: Dashboard V3 CSS |
| 5 | Merge unique JavaScript from DigiTronics_v5.html | Section 1.2: Feature variations |
| 6 | Merge unique HTML from DigiTronics_v5.html | Section 1.2: Feature variations |
| 7 | Validate merge (no feature loss) | Section 8.1: Functional criteria |

#### 23D-3: Reference Update

| # | Task | Justification (Investigation Report) |
|---|------|--------------------------------------|
| 8 | Update manifest.json (start_url → index.html) | Section 1.4: manifest.json reference |
| 9 | Update sw.js (cache only index.html) | Section 1.4: sw.js cache list |
| 10 | Update docker-compose.yml (remove DigiTronics_v5.html) | Section 1.4: docker-compose.yml mount |
| 11 | Update refreshPwaCache() (HTML reference) | Section 2.2: Updated references |

#### 23D-4: Validation

| # | Task | Justification (Investigation Report) |
|---|------|--------------------------------------|
| 12 | Run all E2E tests (80/80) | Section 6.1: Automated testing |
| 13 | Run all backend tests (253/253) | Section 6.1: Automated testing |
| 14 | Test PWA installation | Section 6.2: Manual testing |
| 15 | Test Service Worker update | Section 6.2: Manual testing |
| 16 | Test all CRUD operations | Section 6.2: Manual testing |
| 17 | Verify no console errors | Section 6.2: Manual testing |

#### 23D-5: Cleanup

| # | Task | Justification (Investigation Report) |
|---|------|--------------------------------------|
| 18 | Archive DigiTronics_v5.html | Section 1.5: Backup files |
| 19 | Remove .bak files from repository | Section 1.5: Backup files |
| 20 | Add test-results/ to .gitignore | Section 1.5: Backup files |
| 21 | Force Service Worker update | Section 9.3: Post-merge |

---

## Future Phase Definitions

### Phase 23E — Legacy Cleanup

**Objective:** Remove deprecated code, archive backup files, and clean up repository clutter using the Deprecate → Archive → Delete workflow.

**Scope:**
- Deprecated adapters removal
- Supabase remnants cleanup
- Deprecated helpers removal
- Compatibility layer cleanup
- Obsolete utilities removal

**Dependencies:**
- Phase 23C architecture documentation — **COMPLETE**
- Phase 23D HTML consolidation — **MUST COMPLETE FIRST**

**Entry Criteria:**
- Phase 23D tagged as stable
- All deprecated code identified and marked
- Backup files archived

**Exit Criteria:**
- No references to removed code remain
- Backup files archived to separate branch
- .bak files removed from repository
- test-results/ added to .gitignore
- All tests pass (80/80 E2E, 253+ backend)
- No regression in functionality

---

### Phase 23F — Performance & Optimization

**Objective:** Establish performance baselines, identify bottlenecks through measurement, and implement targeted optimizations.

**Scope:**
- Performance benchmarking
- Cache optimization
- Lazy loading
- Virtual scrolling
- Bundle optimization
- Service Worker optimization

**Dependencies:**
- Phase 23C architecture documentation — **COMPLETE**
- Phase 23D HTML consolidation — **MUST COMPLETE FIRST**
- Phase 23E legacy cleanup — **SHOULD COMPLETE FIRST**

**Entry Criteria:**
- Phase 23E tagged as stable
- Performance baselines established
- Bottlenecks identified through measurement

**Exit Criteria:**
- Performance benchmarks before/after documented
- Vercel cache headers aligned with nginx
- Code splitting implemented (if justified by benchmarks)
- Virtual scroll integrated (if justified by benchmarks)
- All tests pass (80/80 E2E, 253+ backend)
- Performance improvement verified

---

## Phase Dependencies

```
Phase 23B (Backend Migration) [COMPLETE]
    ↓
Phase 23C (Architecture & Technical Debt Assessment) [COMPLETE]
    ↓
Phase 23D (HTML Consolidation)
    ↓
Phase 23E (Legacy Cleanup)
    ↓
Phase 23F (Performance & Optimization)
```

---

## Effort Estimates

| Phase | Effort | Risk |
|-------|--------|------|
| 23C | 2-3 days | Low |
| 23D | 2-3 days | Medium |
| 23E | 1-2 days | Low |
| 23F | 3-5 days | Low |
| **Total** | **8-13 days** | — |

---

## Success Criteria

### Phase 23C
- Architecture documented
- Debt inventory complete
- Target architecture designed
- All work traced to investigation report

### Phase 23D
- Single HTML file entry point
- All references updated
- No regression

### Phase 23E
- Deprecated code removed
- Backup files archived
- Repository clean

### Phase 23F
- Benchmarks established
- Optimizations justified by measurement
- Performance improved

---

*Roadmap generated: 2026-08-05*
*Tag: phase23c-docs*
*Commit: HEAD*
