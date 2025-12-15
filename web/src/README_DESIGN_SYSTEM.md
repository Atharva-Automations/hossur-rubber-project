# UI/UX Professional Design System

## Overview

This document outlines the modern, professional design system used throughout the Hossur Rubber MES application.

## File Structure

```
src/
├── components/
│   ├── global/              # Global reusable components
│   │   ├── header.tsx       # Page headers
│   │   ├── page-container.tsx
│   │   ├── section.tsx
│   │   ├── stats-grid.tsx
│   │   ├── card-compound.tsx
│   │   └── index.ts         # Export all
│   ├── ui/                  # UI primitives
│   │   ├── kpi-card.tsx     # Updated with gradients
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/
│   └── charts/
├── styles/
│   ├── global.css           # Imports theme + tailwind
│   └── theme.css            # New theme variables
└── lib/
    ├── constants.ts         # Colors, gradients, icons
    └── qr-strategy.md       # QR documentation
```

## Theme System

### Color Palette

#### Primary Gradients

- **Purple**: `from-purple-500 to-purple-700`
- **Blue**: `from-blue-500 to-blue-700`
- **Pink**: `from-pink-500 to-pink-700`
- **Cyan**: `from-cyan-500 to-cyan-700`

#### Semantic Colors

- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Danger**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)
- **Pending**: `#f59e0b` (Orange)

#### Grayscale

- **50**: `#f9fafb` (Lightest)
- **100**: `#f3f4f6`
- **200**: `#e5e7eb`
- **300**: `#d1d5db`
- **400**: `#9ca3af`
- **500**: `#6b7280`
- **600**: `#4b5563`
- **700**: `#374151`
- **800**: `#1f2937`
- **900**: `#111827` (Darkest)

### CSS Variables

All theme values are defined as CSS variables in `src/styles/theme.css`:

```css
:root {
  --bg-page: #f8f9fc;
  --bg-card: #ffffff;
  --text-primary: #1a202c;
  --gradient-purple: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
  /* ... more */
}
```

## Component Usage

### KPI Cards (Updated)

```tsx
import { KpiCard } from '@/components/ui/kpi-card';

// Basic usage
<KpiCard title="Total Materials" value={125} />

// With gradient and icon
<KpiCard
  title="Active Items"
  value={98}
  gradient="cyan"
  icon="✓"
  trend={{ value: 12, positive: true }}
/>
```

**Props:**

- `title`: Card heading
- `value`: Main value to display
- `gradient?`: 'purple' | 'blue' | 'pink' | 'cyan'
- `icon?`: Emoji or React component
- `trend?`: `{ value: number, positive: boolean }`
- `className?`: Additional Tailwind classes

### Global Components

#### Header

```tsx
import { Header } from '@/components/global';

<Header
  title="Inward Material Management"
  description="Track incoming materials"
  icon="📦"
/>;
```

#### Page Container

```tsx
import { PageContainer } from '@/components/global';

<PageContainer>{/* All page content here */}</PageContainer>;
```

#### Stats Grid

```tsx
import { StatsGrid } from '@/components/global';

<StatsGrid columns={3}>
  <KpiCard ... />
  <KpiCard ... />
  <KpiCard ... />
</StatsGrid>
```

#### Section

```tsx
import { Section } from '@/components/global';

<Section
  title="Materials List"
  description="View all materials"
  headerAction={<Button>Add Material</Button>}
>
  {/* Content */}
</Section>;
```

#### Card Components

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/global';

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>{/* Main content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>;
```

## Typography

### Font Family

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue'
```

### Sizes

- **h1**: 2rem (32px), 700 weight
- **h2**: 1.5rem (24px), 600 weight
- **h3**: 1.25rem (20px), 600 weight
- **body**: 1rem (16px), 400 weight
- **small**: 0.875rem (14px), 400 weight
- **xs**: 0.75rem (12px), 400 weight

## Icons

Use the constants from `src/lib/constants.ts`:

```tsx
import { ICONS } from '@/lib/constants';

<span>{ICONS.info}</span>  // 📋
<span>{ICONS.success}</span>  // ✓
<span>{ICONS.stock}</span>  // 📦
```

Available icons:

- info, success, warning, error
- stock, supplier, recipe, production, quality, dashboard

## Shadows

- `shadow-sm`: Subtle
- `shadow-md`: Medium
- `shadow-lg`: Large
- `shadow-xl`: Extra large

Used for depth and elevation.

## Spacing Scale

Based on Tailwind's spacing:

- `0`: 0px
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `5`: 1.25rem (20px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)

## Responsive Design

### Breakpoints

- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (wide desktop)
- **2xl**: 1536px (ultra-wide)

### Grid Examples

```tsx
// 1 col on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Status Badges

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="Active" />    // Green
<StatusBadge status="Expired" />   // Red
<StatusBadge status="Pending" />   // Orange
<StatusBadge status="Completed" /> // Blue
```

## Hover & Interaction Effects

### Cards

- Subtle shadow increase on hover
- Slight scale transform (1.02x)
- Transition timing: 300ms

### KPI Cards

- Scale to 1.05 on hover
- Shadow intensifies
- Gradient background is fixed

### Buttons

- Opacity change on hover
- Scale transform
- Focus ring for accessibility

## Dark Mode Support

Theme supports prefers-color-scheme: dark media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #0f172a;
    --bg-card: #1e293b;
    /* ... */
  }
}
```

Currently defaults to light theme, but can be enhanced.

## Performance Considerations

- CSS variables are used for efficient theme switching
- Tailwind classes are purged in production
- Gradients use hardware acceleration
- Smooth scrollbar styling included

## Customization

### Changing Theme Colors

Edit `src/styles/theme.css`:

```css
:root {
  --gradient-purple: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Changing Component Defaults

Update component files directly:

```tsx
// src/components/ui/kpi-card.tsx
const defaultGradient = 'cyan'; // Change from 'blue'
```

### Adding New Status Colors

Update `src/lib/constants.ts`:

```tsx
export const STATUS_COLORS = {
  // ... existing
  NewStatus: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
};
```

## Best Practices

✅ **DO:**

- Use global components for consistency
- Leverage CSS variables for theming
- Use Tailwind for responsive design
- Keep components small and focused
- Use semantic HTML

❌ **DON'T:**

- Hardcode colors (use CSS variables)
- Use arbitrary Tailwind values (use predefined)
- Mix component libraries
- Add inline styles (use Tailwind classes)
- Skip accessibility features

## Migration Checklist

For each module page (e.g., inward, outward, ingredients):

- [ ] Wrap in `<PageContainer>`
- [ ] Add `<Header>` component
- [ ] Use `<StatsGrid>` for KPI cards
- [ ] Use `<Section>` for grouped content
- [ ] Use `<Card>` for white containers
- [ ] Update `KpiCard` to use gradients
- [ ] Add icons from `ICONS` constant
- [ ] Test responsive design (sm, md, lg)
- [ ] Check dark mode support
- [ ] Update navigation if needed

## Examples

See the inward module (`src/app/(dashboard)/inward/page.tsx`) for a complete example of the new design system in action.
