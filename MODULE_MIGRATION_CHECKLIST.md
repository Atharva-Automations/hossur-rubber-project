# 📋 Module Migration Checklist

Use this checklist to apply the new UI system to each module page.

## Pre-Migration (Read Docs First)

- [ ] Read `QUICKSTART_UI.md`
- [ ] Review `README_DESIGN_SYSTEM.md`
- [ ] Study inward module: `app/(dashboard)/inward/page.tsx`
- [ ] Check `COMPONENT_REFERENCE.md`
- [ ] Understand your module's data structure

---

## Module Migration Template

### Module: ******\_\_\_******

**Page Location**: `app/(dashboard)/[MODULE]/page.tsx`
**Start Date**: ****\_****
**Target Completion**: ****\_****

---

## Phase 1: Setup (5 min)

- [ ] Open the module page file
- [ ] Open inward page as reference
- [ ] Check what data is available
- [ ] Identify 3-5 key metrics (KPIs)
- [ ] Plan page layout on paper/whiteboard

---

## Phase 2: Imports (5 min)

Add these imports to the top of the file:

```tsx
import {
  Header,
  PageContainer,
  Section,
  StatsGrid,
  Card,
} from '@/components/global';
import { KpiCard } from '@/components/ui/kpi-card';
```

- [ ] Add global component imports
- [ ] Add KpiCard import
- [ ] Remove old layout imports (if any)
- [ ] Check for any import errors

---

## Phase 3: Wrap Content (5 min)

Wrap entire return with `PageContainer`:

```tsx
return <PageContainer>{/* All content here */}</PageContainer>;
```

- [ ] Wrap content in PageContainer
- [ ] Test layout still works
- [ ] Check responsive (mobile view)

---

## Phase 4: Add Header (5 min)

Add header after PageContainer:

```tsx
<Header
  title="Module Name"
  description="Brief description of what user can do here"
  icon="📦"  {/* Choose appropriate icon */}
/>
```

- [ ] Add Header component
- [ ] Choose appropriate icon
- [ ] Write clear title
- [ ] Add helpful description
- [ ] Visually verify

---

## Phase 5: KPI Cards (15 min)

Replace old KPI cards with gradient cards:

```tsx
<StatsGrid columns={4}>
  <KpiCard
    title="Metric 1"
    value={data1}
    gradient="blue"
    icon="📊"
    trend={{ value: 12, positive: true }}
  />
  <KpiCard title="Metric 2" value={data2} gradient="cyan" icon="✓" />
  {/* ... more cards */}
</StatsGrid>
```

- [ ] Identify available metrics
- [ ] Create KPI cards (max 4 per row)
- [ ] Choose gradient for each card
- [ ] Add icons from ICONS constant
- [ ] Add trend data if available
- [ ] Verify numbers are correct
- [ ] Test responsive (check columns)

**Gradient Options**:

- `purple` - Brand/Featured metrics
- `blue` - Standard metrics
- `cyan` - Active/Available metrics
- `pink` - Alerts/Issues

---

## Phase 6: Content Sections (20 min)

Group content into logical sections:

```tsx
<Section
  title="Analytics / Charts"
  description="Visual data overview"
>
  <Card>
    {/* Chart goes here */}
  </Card>
</Section>

<Section
  title="Items / Data"
  description="Detailed list"
  headerAction={<Button>+ Add Item</Button>}
>
  <Card>
    {/* Table/List goes here */}
  </Card>
</Section>
```

- [ ] Identify content sections (usually 2-4)
- [ ] Wrap each in Section component
- [ ] Add Section title
- [ ] Add Section description
- [ ] Add action button if applicable
- [ ] Wrap main content in Card
- [ ] Test section layout

---

## Phase 7: Data Table (15 min)

Update table styling:

```tsx
<Card noPadding>
  <div className="p-6 border-b">
    <FilterShell>{/* Filter component */}</FilterShell>
  </div>
  <div className="overflow-x-auto">
    <DataTableShell<YourType>
      loading={loading}
      data={data}
      columns={[
        {
          key: 'column1',
          header: 'Column 1',
          render: (r) => <span className="text-gray-900">{r.column1}</span>,
        },
        // ... more columns
      ]}
    />
  </div>
</Card>
```

- [ ] Update Card to use noPadding
- [ ] Add filter section with p-6 padding
- [ ] Add overflow-x-auto wrapper
- [ ] Update table column rendering
- [ ] Add text color classes to renders
- [ ] Add font-semibold for important data
- [ ] Test table on mobile
- [ ] Verify horizontal scroll works

---

## Phase 8: Styling Polish (10 min)

Add finishing touches:

```tsx
// Spacing
<div className="mt-8 space-y-6">
  {/* Sections with gap */}
</div>

// Colors for specific content
<span className="text-green-600 font-semibold">Active</span>
<span className="text-red-600 font-semibold">Expired</span>

// Status badges
<StatusBadge status="Active" />
```

- [ ] Add proper spacing between sections
- [ ] Color code status text
- [ ] Use status badges
- [ ] Add icons where appropriate
- [ ] Verify all text colors
- [ ] Check contrast ratios
- [ ] Test dark backgrounds (if applicable)

---

## Phase 9: Responsive Testing (10 min)

Test all breakpoints:

**Mobile (small)**

- [ ] Cards stack vertically
- [ ] Text readable
- [ ] Buttons touchable
- [ ] No horizontal scroll

**Tablet (medium)**

- [ ] 2-column layout works
- [ ] Cards visible
- [ ] Table scrolls horizontally if needed

**Desktop (large)**

- [ ] 3-4 column layout
- [ ] Full width utilized
- [ ] Typography clear

**Extra Wide (xl)**

- [ ] Content doesn't stretch too far
- [ ] Still readable
- [ ] Margins appropriate

**Testing Steps**:

1. [ ] Open DevTools (F12)
2. [ ] Use device toolbar
3. [ ] Test iPhone SE (375px)
4. [ ] Test iPad (768px)
5. [ ] Test desktop (1024px)
6. [ ] Test wide (1920px)

---

## Phase 10: Accessibility (10 min)

Verify accessibility:

- [ ] Keyboard navigation works (Tab key)
- [ ] Focus visible on all interactive elements
- [ ] Semantic HTML used (`<button>`, `<section>`, etc.)
- [ ] Color not only indicator (icons/text used)
- [ ] Images have alt text
- [ ] Links underlined or clearly marked
- [ ] Form labels associated
- [ ] Error messages clear

**Quick Test**:

1. Disable mouse (try keyboard only)
2. Press Tab repeatedly - can you navigate?
3. Press Enter - do buttons activate?
4. Zoom to 200% - does layout hold?

---

## Phase 11: Browser Testing (10 min)

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (if available)

**Check For**:

- [ ] Colors display correctly
- [ ] No console errors
- [ ] Responsive works
- [ ] Gradients render
- [ ] Shadows appear

---

## Phase 12: Code Review (15 min)

Before committing:

```tsx
// ✅ DO THIS
<PageContainer>
  <Header ... />
  <StatsGrid columns={4}>
    <KpiCard ... />
  </StatsGrid>
  <Section title="...">
    <Card>...</Card>
  </Section>
</PageContainer>

// ❌ DON'T DO THIS
<div className="p-8">
  <div className="grid grid-cols-3">
    <div className="rounded bg-gradient-to-r from-blue-500 to-blue-700 p-6">
      ...
    </div>
  </div>
</div>
```

- [ ] Using global components
- [ ] Using StatsGrid for layout
- [ ] Using Card for containers
- [ ] Using Section for grouped content
- [ ] No hardcoded colors (use gradients/theme)
- [ ] No inline styles (use Tailwind)
- [ ] Proper TypeScript types
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Imports cleaned up

---

## Phase 13: Performance (5 min)

Basic optimization check:

- [ ] No large images unoptimized
- [ ] No unnecessary re-renders
- [ ] Data queries optimized
- [ ] Page load time < 2s
- [ ] No memory leaks
- [ ] CSS is minified (Tailwind handles this)

**Check**:

1. Open DevTools
2. Go to Network tab
3. Reload page
4. Check load time
5. Look for any large files

---

## Phase 14: Documentation (5 min)

- [ ] Updated module description in comments
- [ ] Added any custom hooks explanation
- [ ] Documented data sources
- [ ] Added useful comments for complex logic
- [ ] Listed any module-specific utilities

---

## Phase 15: Testing (15 min)

Functional testing:

- [ ] All data displays correctly
- [ ] Filters work (if applicable)
- [ ] Sorting works (if applicable)
- [ ] Pagination works (if applicable)
- [ ] Buttons navigate correctly
- [ ] Forms submit properly
- [ ] Error states display
- [ ] Loading states visible
- [ ] Empty states handled
- [ ] No 404 or 500 errors

---

## Phase 16: Final Visual Check (10 min)

Compare with design reference:

- [ ] Matches color scheme
- [ ] Typography hierarchy clear
- [ ] Spacing consistent
- [ ] Icons appropriate
- [ ] Icons display correctly
- [ ] Gradients match reference
- [ ] Hover states visible
- [ ] Overall professional appearance

---

## Phase 17: Deploy & Monitor (5 min)

- [ ] Code committed to git
- [ ] Git message clear (e.g., "feat: update inward module with new UI system")
- [ ] Pushed to correct branch
- [ ] PR created with description
- [ ] Ready for code review
- [ ] Post-deployment monitoring set up

---

## Summary Checklist

### Before You Start

- [ ] Environment set up
- [ ] Code editor open
- [ ] Reference materials ready

### During Migration

- [ ] All phases completed
- [ ] No console errors
- [ ] All tests passing
- [ ] Code review ready

### After Migration

- [ ] Merged to main
- [ ] Deployed successfully
- [ ] Monitoring in place
- [ ] Team notified

---

## Time Estimate

| Phase                   | Estimate      | Actual           |
| ----------------------- | ------------- | ---------------- |
| Phase 1: Setup          | 5 min         | \_\_\_           |
| Phase 2: Imports        | 5 min         | \_\_\_           |
| Phase 3: Wrap           | 5 min         | \_\_\_           |
| Phase 4: Header         | 5 min         | \_\_\_           |
| Phase 5: KPI Cards      | 15 min        | \_\_\_           |
| Phase 6: Sections       | 20 min        | \_\_\_           |
| Phase 7: Table          | 15 min        | \_\_\_           |
| Phase 8: Polish         | 10 min        | \_\_\_           |
| Phase 9: Responsive     | 10 min        | \_\_\_           |
| Phase 10: Accessibility | 10 min        | \_\_\_           |
| Phase 11: Browsers      | 10 min        | \_\_\_           |
| Phase 12: Code Review   | 15 min        | \_\_\_           |
| Phase 13: Performance   | 5 min         | \_\_\_           |
| Phase 14: Docs          | 5 min         | \_\_\_           |
| Phase 15: Testing       | 15 min        | \_\_\_           |
| Phase 16: Visual        | 10 min        | \_\_\_           |
| Phase 17: Deploy        | 5 min         | \_\_\_           |
| **TOTAL**               | **2-3 hours** | **\_\_\_ hours** |

---

## Notes & Issues

**Issue**: ******\_\_\_\_******  
**Solution**: ******\_\_\_\_******  
**Resolved**: [ ]

**Issue**: ******\_\_\_\_******  
**Solution**: ******\_\_\_\_******  
**Resolved**: [ ]

---

## Sign-Off

- [ ] Developer tested and verified
- [ ] Code review completed
- [ ] Product manager approved
- [ ] Ready for production

**Developer**: ******\_\_\_\_******  
**Date**: ******\_\_\_\_******  
**Commit Hash**: ******\_\_\_\_******

---

## Modules to Migrate

- [ ] Outward - `app/(dashboard)/outward/page.tsx`
- [ ] Ingredients - `app/(dashboard)/ingredients/page.tsx`
- [ ] Bins - `app/(dashboard)/bins/page.tsx`
- [ ] Recipes - `app/(dashboard)/recipes/page.tsx`
- [ ] Batch - `app/(dashboard)/process/page.tsx` or similar
- [ ] Production - `app/(dashboard)/production/page.tsx`
- [ ] QC/QR - `app/(dashboard)/qc/page.tsx` or `qr/page.tsx`
- [ ] Reports - `app/(dashboard)/reports/page.tsx`
- [ ] Settings - `app/(dashboard)/settings/page.tsx`

---

**Status**: Ready to use! ✅

Copy this checklist for each module you migrate.

Good luck! 🚀
