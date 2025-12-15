# Quick Start Guide - UI Updates

## What Changed

### 1. Modern Theme System

- New `src/styles/theme.css` with CSS variables
- Professional color palette with gradients
- Support for dark mode (prefers-color-scheme)
- Updated `global.css` to import theme

### 2. Updated KPI Cards

- Gradient backgrounds (purple, blue, pink, cyan)
- Hover scale animation (1.05x)
- Optional icon and trend display
- Rounded shadow effects

### 3. New Global Components

```
src/components/global/
├── header.tsx           # Page title + description
├── page-container.tsx   # Responsive max-width wrapper
├── section.tsx          # Grouped content with title
├── stats-grid.tsx       # Responsive grid (2/3/4 cols)
├── card-compound.tsx    # Card + CardHeader + CardContent + CardFooter
└── index.ts             # Barrel export
```

### 4. Constants & Documentation

- `src/lib/constants.ts` - Colors, gradients, icons
- `src/lib/qr-strategy.md` - QR code independence explanation
- `src/README_DESIGN_SYSTEM.md` - Complete design guide

### 5. Updated Prisma Schema

- Removed invalid inward QR relation from WeighedBag
- Each QR is independent (INWARD QR ≠ WEIGHING QR)
- WeighedBag gets brand new QR during production

## Inward Module Update - What You Get

The inward page now features:

```
📦 Inward Material Management  <-- Header with icon
│
├─ 4 KPI Cards (gradient backgrounds)
│  ├─ Total Materials (Blue)
│  ├─ Active Items (Cyan)
│  ├─ Expired (Pink)
│  └─ Total Quantity (Purple)
│
├─ Material Distribution Charts Section
│  └─ Top Suppliers Chart
│
├─ Status Overview (Progress bars)
│  ├─ Active % bar
│  └─ Expired % bar
│
└─ Materials List (Professional table)
   ├─ Filter bar
   ├─ Full data table
   └─ Status badges
```

## How to Use

### Import Global Components

```tsx
import {
  Header,
  PageContainer,
  Section,
  StatsGrid,
  Card,
} from '@/components/global';
```

### Basic Page Structure

```tsx
'use client';

import {
  Header,
  PageContainer,
  Section,
  StatsGrid,
  Card,
} from '@/components/global';
import { KpiCard } from '@/components/ui/kpi-card';

export default function MyPage() {
  return (
    <PageContainer>
      {/* Header */}
      <Header
        title="My Page Title"
        description="Optional description"
        icon="📋"
      />

      {/* KPI Cards */}
      <StatsGrid columns={3}>
        <KpiCard title="Stat 1" value={123} gradient="blue" icon="📊" />
        {/* More cards */}
      </StatsGrid>

      {/* Content Section */}
      <Section title="Content Title">
        <Card>{/* Your content */}</Card>
      </Section>
    </PageContainer>
  );
}
```

## Customization

### Add New Gradient

1. Open `src/styles/theme.css`
2. Add new gradient variable:
   ```css
   --gradient-teal: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
   ```
3. Use in KpiCard:
   ```tsx
   // Update gradientClasses in kpi-card.tsx
   teal: 'from-teal-500 to-teal-700',
   ```

### Change Color Scheme

Edit `src/styles/theme.css` and update CSS variables:

```css
:root {
  --primary: #your-color;
  --success: #your-color;
  /* ... */
}
```

### Add Page Icon

Edit `src/lib/constants.ts`:

```tsx
export const ICONS = {
  // ... existing
  myModule: '🎯',
};
```

## Next Steps

### 1. Update Other Module Pages

Apply the same pattern to:

- [ ] Outward module
- [ ] Ingredients module
- [ ] Bins module
- [ ] Recipes module
- [ ] Production module
- [ ] Batch module

### 2. Create Migration Script (Optional)

```bash
# For each module:
# 1. Wrap content in <PageContainer>
# 2. Add <Header> at top
# 3. Convert KPI cards to new format
# 4. Group content in <Section> + <Card>
# 5. Test responsive design
```

### 3. Test Responsive Design

```
- [ ] Mobile (small)
- [ ] Tablet (medium)
- [ ] Desktop (large)
- [ ] Wide desktop (xl)
```

### 4. Accessibility Check

```
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
```

## Database Changes

### Prisma Schema Updates

The QR independence changes require a migration:

```bash
cd api
npx prisma migrate dev --name remove_inward_qr_relation_from_weighted_bag
```

**Changes:**

- Removed `inwardQrCodeId` field from `WeighedBag`
- Removed `InwardQrCode` relation from `WeighedBag`
- WeighedBag now only has independent production QR

## Important Notes

### QR Code Independence

- **Inward QR** (e.g., INV-MAT-001): Physical bag label, thrown away after outward
- **Weighing QR** (e.g., WB-BATCH001-P1-001): New label created during production
- **Product QR** (e.g., PROD-BATCH001-001): Final product label
- **No relationships** between different QR types

### Theme Switching

If you need to quickly switch themes:

1. Edit CSS variables in `src/styles/theme.css`
2. No component changes needed
3. All components automatically use new colors

## File Reference

### New Files Created

```
web/src/
├── components/global/
│   ├── header.tsx
│   ├── page-container.tsx
│   ├── section.tsx
│   ├── stats-grid.tsx
│   ├── card-compound.tsx
│   └── index.ts
├── styles/
│   └── theme.css
├── lib/
│   ├── constants.ts
│   └── qr-strategy.md
└── README_DESIGN_SYSTEM.md
```

### Modified Files

```
web/src/
├── components/ui/kpi-card.tsx (completely redesigned)
├── styles/global.css (updated imports)
└── app/(dashboard)/inward/page.tsx (full redesign)
```

### Database Changes

```
api/prisma/
└── schema.prisma (removed WeighedBag.inwardQrCodeId)
```

## Support

For questions or issues:

1. Check `src/README_DESIGN_SYSTEM.md` for detailed docs
2. Look at inward module example (`src/app/(dashboard)/inward/page.tsx`)
3. Review `src/lib/constants.ts` for available values
4. Check component source files for prop details

---

**Status**: Ready to use! ✅
**Design System**: Professional & Modern ✨
**Responsive**: Mobile to desktop 📱💻
**Dark Mode**: Supported 🌙
