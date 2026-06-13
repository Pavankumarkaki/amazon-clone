---
name: designing-and-tailwind
description: Designs and styles UI with Tailwind CSS following Amazon-clone design tokens, CSS variables, and responsive patterns. Use when building or editing UI components, styling pages, spacing/colors/typography, responsive layouts, or design token consistency in this frontend.
---

# Designing and Tailwind

## Quick rules

1. **Reuse before inventing** — check existing components, semantic CSS classes, and `@/design-tokens` before adding new styles.
2. **CSS variables first** — prefer `var(--color-*)`, `var(--radius-*)`, `var(--shadow-*)` over hardcoded hex/rgba in components.
3. **Mobile-first** — base styles for small screens; add `sm:`, `md:`, `lg:` only when layout must change.
4. **Compose with `cn()`** — merge conditional classes via `@/lib/utils`.
5. **Match Amazon density** — 14px body, tight spacing, subtle borders/shadows, functional over decorative.

## Styling priority (this repo)

Use in this order:

| Priority | Source | When |
|----------|--------|------|
| 1 | Semantic CSS classes | Buttons, links, cards, product typography |
| 2 | CSS variables in Tailwind | Colors, borders, shadows, layout vars |
| 3 | `@theme` Tailwind utilities | `bg-amazon-header`, `text-amazon-link`, etc. |
| 4 | `@/design-tokens` TS exports | JS logic, docs, non-Tailwind contexts |
| 5 | One-off utilities | Only for layout-specific cases |

### Semantic classes (`globals.css`)

```tsx
// Buttons & links
<Button variant="amazon">Add to Cart</Button>  // uses amazon-btn-primary
<button className="amazon-link">Details</button>

// Cards
<div className="amazon-card p-4">...</div>

// Product typography
<h1 className="text-product-title">...</h1>
<h2 className="text-product-section-heading">...</h2>
<span className="text-product-price">...</span>
<span className="text-product-meta">...</span>
```

### CSS variables in Tailwind

```tsx
// Colors & borders
className="border border-(--color-border) bg-white text-(--color-text-primary)"
className="text-(--color-text-secondary)"
className="text-amazon-link hover:text-(--color-text-link-hover)"

// Tailwind v4 shorthand (also valid)
className="border-(--color-border) max-w-(--container-max)"

// Shadows & radius
className="rounded-sm shadow-(--shadow-card)"

// Layout constants
className="sticky top-[calc(var(--header-height)+var(--subnav-height)+12px)]"
className="mx-auto max-w-(--container-max) px-2 sm:px-4"
```

Do **not** introduce new hex colors in components when a token exists. Add new tokens to `:root` in `globals.css` and mirror in `frontend/src/design-tokens/` if needed in TS.

## Component patterns

### Buttons

Use `@/components/ui/button` variants instead of custom button styling:

```tsx
<Button variant="amazon">Add to Cart</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="amazon-dark">Sign in</Button>
<Button variant="link">See more</Button>
```

### Layout containers

```tsx
<div className="mx-auto max-w-(--container-max) px-2 sm:px-4">
  {/* page content */}
</div>
```

### Cards & panels

White background, light border, small radius, card shadow:

```tsx
<div className="rounded border border-(--color-border) bg-white p-4 shadow-(--shadow-card)">
```

### Links

Use `amazon-link` or `Button variant="link"`. Link color: teal `#007185`, hover: `#c7511f`.

## Responsive design

Breakpoints: default (mobile) → `sm:` (640px) → `md:` (768px) → `lg:` (1024px).

Common patterns in this codebase:

```tsx
// Hide on mobile, show on sm+
className="hidden sm:flex"

// Stack → row
className="flex flex-col gap-4 lg:flex-row"

// Product buy box: full width mobile, fixed sidebar desktop
className="w-full shrink-0 lg:w-[254px]"

// Responsive product title (also handled by .text-product-title)
className="text-2xl lg:text-[28px]"
```

For product pages, provide mobile-specific UI (e.g. `ProductMobileBuyBar`) when desktop buy box is hidden.

Account for sticky header + subnav when using `sticky` or `top-*`:

```tsx
top-[calc(var(--header-height)+var(--subnav-height)+12px)]
```

## General Tailwind practices

- **Spacing scale**: prefer Tailwind spacing (`p-4`, `gap-3`, `mt-2`) aligned to 4px grid; see token reference for named spacing.
- **Typography**: body is 14px (`text-sm` or default); meta text `text-xs` (12px); section headings use semantic classes.
- **Focus states**: `focus-visible:ring-2 focus-visible:ring-[var(--color-text-link)] focus-visible:ring-offset-2`
- **Disabled**: `disabled:pointer-events-none disabled:opacity-50`
- **Transitions**: short (`transition-colors`, `transition-all` with 150–200ms); match existing components.
- **Icons**: Lucide at `h-4 w-4` inline; `shrink-0` on icons in flex rows.
- **Avoid**: arbitrary magic numbers when a token exists; mixing inline `style={{}}` with Tailwind unless dynamic values require it.

## Adding new design tokens

1. Add CSS variable to `:root` in `frontend/src/app/globals.css`
2. If used in JS or shared docs, add to matching file in `frontend/src/design-tokens/`
3. Export from `frontend/src/design-tokens/index.ts`
4. Optionally expose via `@theme inline` if it should be a Tailwind utility
5. Use the new token in components — do not leave orphaned definitions

## Checklist before finishing UI work

- [ ] Uses semantic classes or CSS variables (no stray hex)
- [ ] Responsive at mobile, tablet, and desktop
- [ ] Sticky/fixed elements clear header + subnav
- [ ] Focus and disabled states on interactive elements
- [ ] Matches existing component density and Amazon-like visual language
- [ ] Reuses `Button`, `Card`, and existing product/layout components where possible

## Additional resources

- Full token map and CSS variable list: [reference.md](reference.md)
