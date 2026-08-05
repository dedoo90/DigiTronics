# Phase 23D — Implementation Checklist

**Repository:** E:\Projects\ESO
**Baseline:** phase23c-docs (tag phase23c-docs)
**Date:** 2026-08-05
**Status:** Documentation Only — No Code Changes

---

## Phase 23D-1: Pre-Merge Preparation

### 23D-1.1: Git Tag

- [ ] Create git tag `phase23d-pre-merge`
- [ ] Verify tag exists locally
- [ ] Push tag to remote

### 23D-1.2: Baseline Testing

- [ ] Run all E2E tests (verify.js)
- [ ] Run all backend tests
- [ ] Document baseline results
- [ ] Verify all tests pass

### 23D-1.3: Feature Documentation

- [ ] Document unique CSS in DigiTronics_v5.html
- [ ] Document unique JavaScript in DigiTronics_v5.html
- [ ] Document unique HTML in DigiTronics_v5.html
- [ ] Create feature comparison spreadsheet

---

## Phase 23D-2: Feature Merge

### 23D-2.1: CSS Merge

- [ ] Identify unique CSS in DigiTronics_v5.html
- [ ] Merge Dashboard V3 CSS into index.html
- [ ] Validate CSS (no visual regression)
- [ ] Test responsive design

### 23D-2.2: JavaScript Merge

- [ ] Identify unique JavaScript in DigiTronics_v5.html
- [ ] Merge unique functions into index.html
- [ ] Validate JavaScript (no errors)
- [ ] Test all functionality

### 23D-2.3: HTML Merge

- [ ] Identify unique HTML in DigiTronics_v5.html
- [ ] Merge unique elements into index.html
- [ ] Validate HTML (no structural issues)
- [ ] Test all forms and modals

### 23D-2.4: Merge Validation

- [ ] Run all E2E tests
- [ ] Verify no feature loss
- [ ] Verify no console errors
- [ ] Verify PWA functionality

---

## Phase 23D-3: Reference Update

### 23D-3.1: manifest.json Update

- [ ] Update `start_url` to `index.html`
- [ ] Update `name` if needed
- [ ] Verify PWA installation
- [ ] Test on multiple devices

### 23D-3.2: Service Worker Update

- [ ] Update cache list to only `index.html`
- [ ] Remove `DigiTronics_v5.html` from cache
- [ ] Test SW update
- [ ] Verify cache invalidation

### 23D-3.3: docker-compose.yml Update

- [ ] Remove `DigiTronics_v5.html` mount
- [ ] Verify docker-compose up
- [ ] Test application in Docker

### 23D-3.4: refreshPwaCache() Update

- [ ] Update HTML reference to `index.html`
- [ ] Test cache refresh
- [ ] Verify no errors

---

## Phase 23D-4: Validation

### 23D-4.1: Automated Testing

- [ ] Run all E2E tests (80/80)
- [ ] Run all backend tests (253/253)
- [ ] Verify no test failures
- [ ] Document test results

### 23D-4.2: Manual Testing

- [ ] Test PWA installation
- [ ] Test Service Worker update
- [ ] Test all CRUD operations
- [ ] Test offline mode
- [ ] Test responsive design
- [ ] Verify no console errors

### 23D-4.3: Visual Regression

- [ ] Compare UI before/after merge
- [ ] Verify no visual differences
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## Phase 23D-5: Cleanup

### 23D-5.1: Archive DigiTronics_v5.html

- [ ] Create archive branch (if needed)
- [ ] Move DigiTronics_v5.html to archive
- [ ] Remove from main branch
- [ ] Verify no references remain

### 23D-5.2: Remove .bak Files

- [ ] List all .bak files
- [ ] Remove from version control
- [ ] Add *.bak to .gitignore
- [ ] Verify removal

### 23D-5.3: test-results/ Cleanup

- [ ] Add test-results/ to .gitignore
- [ ] Remove from version control (if tracked)
- [ ] Verify .gitignore entry

### 23D-5.4: Force SW Update

- [ ] Update SW cache name
- [ ] Force SW update on deployment
- [ ] Verify old caches cleared

---

## Validation

### Before Completion

- [ ] All Phase 23D-1 tasks complete
- [ ] All Phase 23D-2 tasks complete
- [ ] All Phase 23D-3 tasks complete
- [ ] All Phase 23D-4 tasks complete
- [ ] All Phase 23D-5 tasks complete
- [ ] All E2E tests pass (80/80)
- [ ] All backend tests pass (253/253)
- [ ] No regression in functionality
- [ ] PWA installs correctly
- [ ] Service Worker updates correctly

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 23D-1 | Pre-Merge Preparation | [ ] Not Started |
| 23D-2 | Feature Merge | [ ] Not Started |
| 23D-3 | Reference Update | [ ] Not Started |
| 23D-4 | Validation | [ ] Not Started |
| 23D-5 | Cleanup | [ ] Not Started |
| **Total** | **21 tasks** | **0% Complete** |

---

## Future Phases

| Phase | Name | Status |
|-------|------|--------|
| 23E | Legacy Cleanup | Pending |
| 23F | Performance & Optimization | Pending |

---

*Checklist generated: 2026-08-05*
*Tag: phase23c-docs*
*Commit: HEAD*
