# 📋 Tasks - Interactive Laptop Tutorial

## 🔥 Urgent (Do Today)

### 1. Fix Module1 ContextMenu Issue
- [x] Remove `asChild` prop from ContextMenu.Trigger
- [x] Use `builders` pattern correctly (Svelte 5 syntax)
- [x] Test right-click functionality
- [x] Verify no TypeScript errors

**File:** `src/lib/components/modules/Module1.svelte:219`
**Priority:** ✅ Completed
**Estimated Time:** 15 min

### 2. Test Module Navigation
- [ ] Click on each module button
- [ ] Verify module content loads
- [ ] Test "back to modules" button
- [ ] Check console for errors

**Priority:** 🔴 Critical
**Estimated Time:** 10 min

### 3. Test Language Switcher
- [x] Toggle between English/Greek
- [x] Verify all text changes
- [x] Check URL params update
- [x] Test page reload persistence

**Priority:** 🟡 High
**Estimated Time:** 10 min

### 4. Verify Logout Functionality
- [x] Click logout button
- [x] Confirm redirect to login
- [x] Verify session cleared
- [x] Test re-login

**Priority:** 🟡 High
**Estimated Time:** 5 min

## 🎯 High Priority (This Week)

### 5. Fix Turso DB Connection
- [x] Check `TURSO_AUTH_TOKEN` in `.env`
- [x] Verify `TURSO_DATABASE_URL` is correct
- [x] Test database connection
- [x] Implement error handling for DB failures
- [x] Add fallback to local DB

**Files:** `src/lib/server/db/index.ts`, `.env`
**Priority:** 🟡 High
**Estimated Time:** 1 hour

### 6. Complete Module Content
- [ ] Module 1: All 6 exercises functional
- [ ] Module 2: Keyboard shortcuts
- [ ] Module 3: File management
- [ ] Module 4: Advanced features
- [ ] Add Greek translations for all modules

**Priority:** 🟡 High
**Estimated Time:** 4 hours

### 7. Improve Error Handling
- [ ] Add `<svelte:boundary>` for error catching
- [ ] Create error display component
- [ ] Add user-friendly error messages
- [ ] Log errors to console (dev) / service (prod)

**Priority:** 🟡 High
**Estimated Time:** 2 hours

### 8. Add Loading States
- [x] Module loading spinner
- [x] Button loading states
- [x] Progress save feedback
- [x] Network request indicators

**Priority:** 🟢 Medium
**Estimated Time:** 1.5 hours

## 📚 Medium Priority (Next Week)

### 9. Implement Progress Persistence
- [x] Save progress to Turso DB
- [x] Load progress on mount
- [x] Sync progress across sessions
- [x] Handle offline mode

**Priority:** 🟢 Medium
**Estimated Time:** 3 hours

### 10. Add Unit Tests
- [ ] Setup Vitest properly
- [ ] Test gameStore functions
- [ ] Test utility functions
- [ ] Test component mounting
- [ ] Aim for 60% coverage

**Priority:** 🟢 Medium
**Estimated Time:** 4 hours

### 11. Improve Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios
- [ ] Add screen reader support

**Priority:** 🟢 Medium
**Estimated Time:** 2 hours

### 12. Mobile Responsiveness
- [ ] Test on mobile devices
- [ ] Fix layout issues < 768px
- [ ] Add touch-friendly targets
- [ ] Test on iOS/Android

**Priority:** 🟢 Medium
**Estimated Time:** 2 hours

## 🔮 Low Priority (Future)

### 13. Performance Optimization
- [x] Lazy load modules
- [x] Optimize bundle size
- [x] Add service worker
- [ ] Implement caching strategy

**Priority:** 🔵 Low
**Estimated Time:** 3 hours

### 14. Analytics Integration
- [ ] Choose analytics platform
- [ ] Track user progress
- [ ] Monitor completion rates
- [ ] A/B test features

**Priority:** 🔵 Low
**Estimated Time:** 2 hours

### 15. User Feedback System
- [ ] Add feedback form
- [ ] Star rating system
- [ ] Bug report functionality
- [ ] Feature request tracking

**Priority:** 🔵 Low
**Estimated Time:** 3 hours

### 16. Documentation
- [x] Update README with setup instructions
- [x] Document component APIs
- [x] Create contribution guide
- [x] Add code comments

**Priority:** 🔵 Low
**Estimated Time:** 2 hours

## 🐛 Known Bugs to Fix

### Bug #1: HTML Structure
- ✅ **FIXED** - Extra `</div>` in +page.svelte

### Bug #2: ContextMenu asChild
- ✅ **FIXED** - Module1.svelte line 219 - removed asChild prop

### Bug #3: Turso Auth
- 🔄 **INVESTIGATING** - 401 error on connection

## 📊 Progress Tracking

```
Total Tasks:     16
Completed:       2 (13%)
In Progress:     2 (13%)
Not Started:     12 (74%)
```

### Today's Goals
- [x] Fix HTML structure issue
- [x] Fix ContextMenu issue
- [ ] Test all navigation flows
- [ ] Verify language switching

### This Week's Goals
- [ ] Complete all urgent tasks
- [ ] Fix Turso DB connection
- [ ] Complete at least 2 modules
- [ ] Add basic error handling

---

## 📝 Notes

### Development Workflow
1. Always run `npm run check` before committing
2. Test in browser after each change
3. Check console for warnings/errors
4. Update this task list

### Git Commits Convention
- `feat:` new features
- `fix:` bug fixes
- `refactor:` code restructuring
- `docs:` documentation
- `test:` testing
- `style:` formatting

### Quick Commands
```bash
# Development
npm run dev

# Type checking
npm run check

# Build
npm run build

# Preview production
npm run preview
```

---
*Last Updated: 2025-11-20 21:00*
