<!-- Component Quick Reference Card -->

# 🎨 Component Quick Reference

## Import Everything You Need

```tsx
// Global Components
import {
  Header,
  PageContainer,
  Section,
  StatsGrid,
  Card,
} from '@/components/global';

// UI Components
import { KpiCard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';

// Constants
import { GRADIENTS, ICONS, STATUS_COLORS } from '@/lib/constants';
```

---

## Global Components

### PageContainer

**Purpose**: Responsive max-width wrapper for entire page

```tsx
<PageContainer>{/* All page content */}</PageContainer>
```

**Props**: `className?`

**Notes**:

- Max width: 7xl (80rem)
- Padding: 4 (mobile), 6 (sm), 8 (lg)
- Responsive on all breakpoints

---

### Header

**Purpose**: Page title with optional icon and description

```tsx
<Header
  title="My Page Title"
  description="Optional description text"
  icon="📦"
/>
```

**Props**:

- `title` (required): Page heading
- `description?`: Subtitle or description
- `icon?`: Emoji or React component

**Notes**:

- Title: 2xl bold (32px)
- Description: text-gray-600
- Icon size: 4xl

---

### StatsGrid

**Purpose**: Responsive grid for KPI cards

```tsx
<StatsGrid columns={4}>
  <KpiCard ... />
  <KpiCard ... />
  <KpiCard ... />
  <KpiCard ... />
</StatsGrid>
```

**Props**:

- `columns`: 2 | 3 | 4 (default: 3)
- `children` (required): Card components
- `className?`: Additional classes

**Breakpoints**:

- 2 cols: 1 (sm), 2 (md)
- 3 cols: 1 (sm), 2 (md), 3 (lg)
- 4 cols: 1 (sm), 2 (md), 4 (lg)

---

### Section

**Purpose**: Container for grouped content with title

```tsx
<Section
  title="Section Title"
  description="Optional description"
  headerAction={<Button>Action</Button>}
>
  {/* Content here */}
</Section>
```

**Props**:

- `title?`: Section heading
- `description?`: Subtitle
- `children` (required): Content
- `headerAction?`: Action button/element
- `className?`: Additional classes

**Notes**:

- Title: xl bold
- Description: text-gray-600
- Action aligns right

---

### Card

**Purpose**: Container component with optional sections

```tsx
<Card>
  {/* Simple content */}
</Card>

<Card noPadding>
  {/* Custom layout - manage padding yourself */}
</Card>

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Props**:

- `children` (required): Card content
- `className?`: Additional classes
- `noPadding?`: Remove default padding

**Notes**:

- Default padding: p-6
- Background: white
- Border: subtle
- Shadow: sm (hover: md)
- Rounded: 2xl

---

### CardHeader / CardContent / CardFooter

**Purpose**: Structural components for Card content

```tsx
<CardHeader>
  <h3 className="text-lg font-semibold">Header</h3>
</CardHeader>

<CardContent>
  <p>Main content goes here</p>
</CardContent>

<CardFooter>
  <Button>Action</Button>
</CardFooter>
```

**Notes**:

- Header: pb-4, border-bottom
- Content: pt-4
- Footer: pt-4, border-top

---

## UI Components

### KpiCard

**Purpose**: Gradient metric/stat card

```tsx
<KpiCard
  title="Total Items"
  value={125}
  gradient="blue"
  icon="📊"
  trend={{ value: 12, positive: true }}
/>
```

**Props**:

- `title` (required): Card heading
- `value` (required): Main number/text
- `gradient?`: 'purple' | 'blue' | 'pink' | 'cyan'
- `icon?`: Emoji or icon component
- `trend?`: { value: number, positive: boolean }
- `className?`: Additional classes

**Gradients**:

- `purple`: #a855f7 → #d946ef
- `blue`: #3b82f6 → #1d4ed8
- `pink`: #f43f5e → #e11d48
- `cyan`: #06b6d4 → #0891b2

**Notes**:

- Background: Full gradient
- Text: White
- Hover: Scale 1.05, shadow increase
- Trend: Shows ↑↓ and percentage

---

### Button

**Purpose**: Action button component

```tsx
<Button>Click Me</Button>

<Button variant="destructive">Delete</Button>

<Button disabled>Disabled</Button>

<Button className="w-full">Full Width</Button>
```

**Props**: Check `components/ui/button.tsx`

**Variants**:

- default: Blue primary
- secondary: Gray
- destructive: Red
- ghost: Transparent

---

### Table

**Purpose**: Data table component

```tsx
<Table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    {data.map((item) => (
      <tr key={item.id}>
        <td>{item.col1}</td>
        <td>{item.col2}</td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Notes**: Check `components/ui/table.tsx`

---

### StatusBadge

**Purpose**: Status indicator badge

```tsx
<StatusBadge status="Active" />
<StatusBadge status="Expired" />
<StatusBadge status="Pending" />
<StatusBadge status="Completed" />
```

**Props**:

- `status` (required): Status text

**Status Colors**:

- Active: Green
- Expired: Red
- Pending: Orange
- Completed: Blue

---

## Constants

### GRADIENTS

```tsx
import { GRADIENTS } from '@/lib/constants';

Object.keys(GRADIENTS);
// ['purple', 'blue', 'pink', 'cyan', 'orange', 'green', 'red']
```

### ICONS

```tsx
import { ICONS } from '@/lib/constants';

ICONS.info; // 📋
ICONS.success; // ✓
ICONS.warning; // ⚠️
ICONS.error; // ✕
ICONS.stock; // 📦
ICONS.supplier; // 🏭
ICONS.recipe; // 📝
ICONS.production; // ⚙️
ICONS.quality; // ✓
ICONS.dashboard; // 📊
```

### STATUS_COLORS

```tsx
import { STATUS_COLORS } from '@/lib/constants';

STATUS_COLORS.Active;
// { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' }
```

---

## Common Patterns

### Full Page Layout

```tsx
export default function Page() {
  return (
    <PageContainer>
      <Header
        title="Page Title"
        description="Description"
        icon="📦"
      />

      <StatsGrid columns={4}>
        <KpiCard ... />
        <KpiCard ... />
        <KpiCard ... />
        <KpiCard ... />
      </StatsGrid>

      <Section title="Content">
        <Card>{/* Content */}</Card>
      </Section>
    </PageContainer>
  );
}
```

### Two Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Section>
    <Card>{/* Left content */}</Card>
  </Section>
  <Section>
    <Card>{/* Right content */}</Card>
  </Section>
</div>
```

### Cards with Actions

```tsx
<Section title="Items" headerAction={<Button>Add Item</Button>}>
  <Card>{/* Table or list */}</Card>
</Section>
```

### Status Overview

```tsx
<Card>
  <div className="space-y-4">
    <div className="flex justify-between">
      <span>Active</span>
      <span className="font-semibold text-green-600">98</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-green-500" style={{ width: '98%' }} />
    </div>
  </div>
</Card>
```

### Form with Card

```tsx
<Card>
  <CardHeader>
    <h3>Form Title</h3>
  </CardHeader>
  <CardContent>{/* Form inputs */}</CardContent>
  <CardFooter>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

---

## Tailwind Classes Guide

### Spacing

```tsx
p - 4; // padding: 1rem
p - 6; // padding: 1.5rem
m - 4; // margin: 1rem
gap - 6; // grid-gap: 1.5rem
```

### Colors

```tsx
text - gray - 900; // Primary text
text - gray - 600; // Secondary text
text - gray - 400; // Muted text
bg - white; // White background
bg - gray - 50; // Light background
bg - gradient - to - br; // Gradient direction
from - blue - 500; // Gradient start
to - blue - 700; // Gradient end
```

### Sizing

```tsx
w-full             // 100% width
h-64               // Fixed height
max-w-7xl          // Max width
```

### Responsive

```tsx
sm: block; // Show on small+ screens
md: flex; // Flex on medium+ screens
lg: grid - cols - 3; // 3 columns on large+ screens
```

### Effects

```tsx
shadow - sm; // Subtle shadow
hover: shadow - lg; // Hover shadow
rounded - lg; // Border radius
transition - all; // Smooth transition
```

---

## Color Reference

### Backgrounds

- `bg-white`: #fff
- `bg-gray-50`: #f9fafb
- `bg-gray-100`: #f3f4f6
- `bg-blue-50`: #eff6ff

### Text

- `text-gray-900`: #111827
- `text-gray-600`: #4b5563
- `text-gray-500`: #6b7280
- `text-blue-600`: #2563eb
- `text-white`: #fff

### Status

- Green: Success (`bg-green-100`, `text-green-700`)
- Red: Danger (`bg-red-100`, `text-red-700`)
- Orange: Warning (`bg-orange-100`, `text-orange-700`)
- Blue: Info (`bg-blue-100`, `text-blue-700`)

---

## Performance Tips

✅ **DO**:

- Use React.memo for expensive components
- Memoize callbacks with useCallback
- Debounce rapid state updates
- Lazy load images with next/image

❌ **DON'T**:

- Create styles inside render functions
- Use inline objects as props
- Nest too many components
- Load all data at once

---

## Accessibility Checklist

- [ ] Use semantic HTML (`<button>`, `<section>`, etc.)
- [ ] Add alt text to images
- [ ] Use focus-ring for keyboard navigation
- [ ] Add ARIA labels where needed
- [ ] Ensure color contrast ≥ 4.5:1
- [ ] Test with keyboard only
- [ ] Test with screen reader

---

## Quick Debug

### Component not styling?

```
1. Check import is correct
2. Verify theme.css is imported
3. Check Tailwind classes exist
4. Use browser devtools
```

### Gradients not showing?

```
1. Use both from-*/to-* classes
2. Add bg-gradient-to-br/to-r
3. Check gradient name in constants
4. Verify hex values in theme.css
```

### Responsive not working?

```
1. Use mobile-first approach
2. Check breakpoint: sm: (640px)
3. Use grid-cols-1 default
4. Add md:, lg:, xl: for bigger screens
```

---

## Resources

- **Component Files**: `src/components/global/` and `src/components/ui/`
- **Theme**: `src/styles/theme.css`
- **Constants**: `src/lib/constants.ts`
- **Example**: `app/(dashboard)/inward/page.tsx`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

## Version

Current: v1.0 (December 2025)

---

**Happy Building! 🚀**
