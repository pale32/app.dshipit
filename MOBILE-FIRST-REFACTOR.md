# Mobile-First Refactoring Plan

## Approach
- Review each section for necessity (is this feature useful?)
- Review UI (does it make sense on mobile?)
- Mobile-first: design for mobile, add desktop enhancements with `md:` or `lg:` only when needed
- Work incrementally, one section at a time

---

## Increment 1: Top Navigation
**File:** `src/components/TopNavigation.tsx`

**Current State:**
- Hamburger menu (mobile only)
- Logo
- Store switcher (desktop only)
- Stats ticker (desktop only)
- Help, Settings, Theme buttons (desktop only)
- Notifications, Profile (all screens)

**Review Questions:**
- [ ] Is stats ticker necessary on mobile? Or keep desktop only?
- [ ] Should store switcher be accessible on mobile? (dropdown in menu?)
- [ ] Are Help/Settings needed in top nav or move to sidebar?
- [ ] Review promo bar border/shadow visibility

---

## Increment 2: Sidebar
**File:** `src/components/Sidebar.tsx`

**Current State:**
- Fixed sidebar on desktop (272px)
- Overlay drawer on mobile (triggered by hamburger)

**Review Questions:**
- [ ] Is current mobile overlay pattern acceptable?
- [ ] Review menu items - are all necessary?
- [ ] Check import list count badge visibility
- [ ] Review collapsed vs expanded states

---

## Increment 3: App Layout
**File:** `src/components/AppLayout.tsx`

**Current State:**
- Main content has `md:ml-[272px]` for sidebar space
- `pt-16` for top nav

**Review Questions:**
- [ ] Is layout structure correct for mobile-first?
- [ ] Review content padding/margins on mobile

---

## Increment 4: Find Products Page
**File:** `src/app/find-products/page.tsx`

**Current State:**
- Vendor tabs (dropdown on mobile, buttons on desktop)
- Search bar with vendor logo
- Add-to-import sticky bar
- Product grid (2 cols mobile, up to 5 cols desktop)
- Filter sheet

**Review Questions:**
- [ ] Is vendor dropdown on mobile good UX?
- [ ] Review sticky bar positioning (currently top-[178px])
- [ ] Is product grid column count correct?
- [ ] Review filter sheet content - all filters necessary?
- [ ] Check infinite scroll behavior

---

## Increment 5: Import List Page
**File:** `src/app/import-list/page.tsx`

**Review Questions:**
- [ ] Review product card layout on mobile
- [ ] Check action buttons accessibility
- [ ] Review bulk actions on mobile

---

## Increment 6: Orders Pages
**Files:** `src/app/open-orders/page.tsx`, `src/app/fulfilled/page.tsx`

**Review Questions:**
- [ ] Review table/list layout on mobile
- [ ] Check filter bar usability
- [ ] Review order details accessibility

---

## Increment 7: Analytics Page
**File:** `src/app/analytics/page.tsx`

**Review Questions:**
- [ ] Review chart visibility on mobile
- [ ] Check card grid layout
- [ ] Are all metrics necessary on mobile view?

---

## Increment 8: Settings & Other Pages
**Files:** Various settings pages

**Review Questions:**
- [ ] Review form layouts on mobile
- [ ] Check modal/dialog usability
- [ ] Review any remaining pages

---

## Progress Tracker

| Increment | Status | Notes |
|-----------|--------|-------|
| 1. Top Navigation | Not Started | |
| 2. Sidebar | Not Started | |
| 3. App Layout | Not Started | |
| 4. Find Products | Not Started | |
| 5. Import List | Not Started | |
| 6. Orders Pages | Not Started | |
| 7. Analytics | Not Started | |
| 8. Settings & Other | Not Started | |

---

## How to Use This Document
1. Pick an increment to work on
2. Review the questions for that section
3. Discuss decisions with user
4. Make changes only to that section
5. Test on mobile
6. Mark as complete and move to next increment
