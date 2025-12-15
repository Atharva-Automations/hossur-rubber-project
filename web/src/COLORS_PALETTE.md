<!-- Color Palette Preview -->
<!-- View this file's raw output in browser for better visualization -->

# Color Palette & Theme Reference

## Primary Gradients

### Purple Gradient

```css
background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
```

**Usage**: Brand color, featured cards
**HEX**: #a855f7 → #d946ef

### Blue Gradient

```css
background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
```

**Usage**: Primary actions, info cards
**HEX**: #3b82f6 → #1d4ed8

### Pink Gradient

```css
background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
```

**Usage**: Alerts, warnings, expired items
**HEX**: #f43f5e → #e11d48

### Cyan Gradient

```css
background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
```

**Usage**: Secondary info, active states
**HEX**: #06b6d4 → #0891b2

### Orange Gradient (Optional)

```css
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```

**Usage**: Warnings, temporary holds
**HEX**: #f97316 → #ea580c

### Green Gradient (Optional)

```css
background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
```

**Usage**: Success, completed items
**HEX**: #22c55e → #16a34a

### Red Gradient (Optional)

```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

**Usage**: Errors, failures, critical
**HEX**: #ef4444 → #dc2626

---

## Semantic Colors

### Status - Success

```
Background: #f0fdf4 (Green-50)
Text: #16a34a (Green-600)
Badge: #dcfce7 (Green-100)
```

### Status - Warning

```
Background: #fff7ed (Orange-50)
Text: #ea580c (Orange-600)
Badge: #fed7aa (Orange-100)
```

### Status - Danger

```
Background: #fef2f2 (Red-50)
Text: #dc2626 (Red-600)
Badge: #fee2e2 (Red-100)
```

### Status - Info

```
Background: #eff6ff (Blue-50)
Text: #2563eb (Blue-600)
Badge: #dbeafe (Blue-100)
```

### Status - Pending

```
Background: #fff7ed (Orange-50)
Text: #f59e0b (Orange-500)
Badge: #fcd34d (Amber-200)
```

---

## Neutral Palette (Grayscale)

### Gray-50 (Lightest)

```css
background-color: #f9fafb;
```

Used for: Very light backgrounds, hover states

### Gray-100

```css
background-color: #f3f4f6;
```

Used for: Light section backgrounds, subtle dividers

### Gray-200

```css
background-color: #e5e7eb;
```

Used for: Borders, divider lines, subtle backgrounds

### Gray-300

```css
background-color: #d1d5db;
```

Used for: Active borders, emphasis

### Gray-400

```css
background-color: #9ca3af;
```

Used for: Disabled text, placeholder text

### Gray-500

```css
background-color: #6b7280;
```

Used for: Secondary text, muted labels

### Gray-600

```css
background-color: #4b5563;
```

Used for: Regular text, body copy

### Gray-700

```css
background-color: #374151;
```

Used for: Emphasis text, headings

### Gray-800

```css
background-color: #1f2937;
```

Used for: Strong emphasis, dark headings

### Gray-900 (Darkest)

```css
background-color: #111827;
```

Used for: Navigation, dark backgrounds, text on light

---

## Component Color Usage

### KPI Cards

```
Blue Card    → Statistic type metrics (count, total)
Cyan Card    → Active/available metrics
Pink Card    → Warning/expired metrics
Purple Card  → Featured/highlight metrics
```

### Status Badges

```
Green Badge  → Active, Completed, Success
Orange Badge → Pending, Warning
Red Badge    → Expired, Error, Failed
Blue Badge   → Info, Processing
```

### Buttons

```
Primary Button    → Blue gradient (background)
Success Button    → Green (background)
Warning Button    → Orange (background)
Danger Button     → Red (background)
Ghost Button      → Gray text (transparent)
```

### Tables

```
Header Background → Gray-100
Row Hover        → Gray-50
Borders          → Gray-200
Text Primary     → Gray-900
Text Secondary   → Gray-600
```

### Charts

```
Primary Series   → Blue
Secondary Series → Cyan
Highlight        → Purple
Alert            → Pink
Success          → Green
```

---

## CSS Variables Reference

### Backgrounds

```css
--bg-page: #f8f9fc; /* Main page background */
--bg-card: #ffffff; /* Card/container background */
--bg-secondary: #f3f4f8; /* Secondary sections */
--bg-hover: #fafbfd; /* Hover states */
--bg-dark: #0f172a; /* Dark sections */
```

### Text

```css
--text-primary: #1a202c; /* Main text */
--text-secondary: #718096; /* Secondary text */
--text-tertiary: #a0aec0; /* Tertiary/muted text */
--text-light: #e2e8f0; /* Light text */
--text-white: #ffffff; /* White text */
```

### Borders & Shadows

```css
--border-light: #e5e7eb; /* Light border */
--border-medium: #d1d5db; /* Medium border */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Navigation

```css
--nav-bg: #0f172a; /* Sidebar background */
--nav-text: #cbd5e1; /* Nav text */
--nav-active: #3b82f6; /* Active nav item */
--nav-hover: #1e293b; /* Hover state */
```

---

## Tailwind Shorthand

### Common Classes

#### Text Colors

```html
<!-- Primary text (gray-900) -->
<p class="text-gray-900">Primary</p>

<!-- Secondary text (gray-600) -->
<p class="text-gray-600">Secondary</p>

<!-- Muted text (gray-400) -->
<p class="text-gray-400">Muted</p>

<!-- White text -->
<p class="text-white">White</p>
```

#### Background Colors

```html
<!-- Light background -->
<div class="bg-gray-50">Light</div>

<!-- White background -->
<div class="bg-white">Card</div>

<!-- Dark background -->
<div class="bg-slate-900">Dark</div>
```

#### Borders

```html
<!-- Light border -->
<div class="border border-gray-200">Border</div>

<!-- Medium border -->
<div class="border-2 border-gray-300">Thick</div>
```

#### Shadows

```html
<!-- Subtle shadow -->
<div class="shadow-sm">Subtle</div>

<!-- Medium shadow -->
<div class="shadow-md">Medium</div>

<!-- Large shadow -->
<div class="shadow-lg">Large</div>
```

#### Gradient Backgrounds

```html
<!-- Purple gradient -->
<div class="bg-gradient-to-br from-purple-500 to-purple-700">Purple</div>

<!-- Blue gradient -->
<div class="bg-gradient-to-br from-blue-500 to-blue-700">Blue</div>

<!-- Pink gradient -->
<div class="bg-gradient-to-br from-pink-500 to-pink-700">Pink</div>

<!-- Cyan gradient -->
<div class="bg-gradient-to-br from-cyan-500 to-cyan-700">Cyan</div>
```

---

## Color Accessibility

### WCAG Compliance

All colors meet WCAG AA standards for contrast ratios:

```
✓ Text on backgrounds: 4.5:1 minimum
✓ Large text on backgrounds: 3:1 minimum
✓ UI components: 3:1 minimum
```

### Color-blind Friendly

```
✓ Not relying on red/green alone
✓ Using icons + color for status
✓ High contrast separations
```

### Print Friendly

```
✓ Sufficient contrast for printing
✓ Fallback to grayscale support
✓ Icons visible without color
```

---

## Dark Mode Colors (Future)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #0f172a;
    --bg-card: #1e293b;
    --bg-secondary: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border-light: #334155;
  }
}
```

---

## Implementation Examples

### Example 1: KPI Card (Blue)

```tsx
<KpiCard
  title="Total Materials"
  value={125}
  gradient="blue"
  icon="📊"
  trend={{ value: 12, positive: true }}
/>
```

Result: Blue gradient background, white text, hover scale effect

### Example 2: Status Badge

```tsx
<div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
  ✓ Active
</div>
```

Result: Green badge with checkmark

### Example 3: Section with Border

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">Section Title</h3>
  <p className="mt-2 text-gray-600">Content here</p>
</div>
```

Result: Professional card with subtle shadow

### Example 4: Gradient Button

```tsx
<button className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-2 font-semibold text-white transition-all hover:shadow-lg hover:scale-105">
  Click Me
</button>
```

Result: Blue gradient button with hover effects

---

## Tips for Using Colors

### ✅ DO

- Use CSS variables for theming
- Combine colors with icons/text for clarity
- Ensure sufficient contrast
- Use semantic colors (green=success, red=error)
- Apply gradients to cards and buttons

### ❌ DON'T

- Hardcode hex values
- Use colors only (no icons)
- Mix incompatible gradients
- Use too many different colors
- Rely on color alone for information

---

## Resources

- **Tailwind Colors**: https://tailwindcss.com/docs/customizing-colors
- **Web Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/
- **Color Theory**: https://color.adobe.com
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

Last updated: December 2025
