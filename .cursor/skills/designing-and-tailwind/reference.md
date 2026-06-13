# Design Token Reference

## CSS variables (`globals.css :root`)

### Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-header-primary` | `#131921` | Main navbar |
| `--color-header-secondary` | `#232f3e` | Subnav, dark buttons |
| `--color-header-hover` | `#37475a` | Header hover states |
| `--color-accent-orange` | `#ff9900` | Accent, Prime-style highlights |
| `--color-accent-yellow` | `#ffd814` | Primary CTA buttons |
| `--color-accent-yellow-hover` | `#f7ca00` | CTA hover |
| `--color-accent-yellow-active` | `#f0b800` | CTA active/pressed |
| `--color-bg-page` | `#eaeded` | Page background |
| `--color-bg-card` | `#ffffff` | Card/panel background |
| `--color-text-primary` | `#0f1111` | Main text |
| `--color-text-secondary` | `#565959` | Secondary text |
| `--color-text-muted` | `#888c8c` | Muted/meta text |
| `--color-text-link` | `#007185` | Links |
| `--color-text-link-hover` | `#c7511f` | Link hover |
| `--color-border` | `#d5d9d9` | Default borders |
| `--color-border-light` | `#e7e7e7` | Subtle dividers |
| `--color-deal` | `#cc0c39` | Deal/sale prices |
| `--color-in-stock` | `#007600` | In-stock badge |
| `--color-rating-gold` | `#ffa41c` | Star ratings |
| `--color-footer-top` | `#37475a` | Footer top bar |
| `--color-footer-main` | `#232f3e` | Footer main |

### Shadows

| Variable | Value |
|----------|-------|
| `--shadow-card` | `0 2px 5px rgba(15, 17, 17, 0.1)` |
| `--shadow-card-hover` | `0 4px 12px rgba(15, 17, 17, 0.15)` |
| `--shadow-drawer` | `0 0 14px rgba(15, 17, 17, 0.25)` |

### Radius

| Variable | Value |
|----------|-------|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |

### Layout

| Variable | Value |
|----------|-------|
| `--header-height` | `60px` |
| `--subnav-height` | `39px` |
| `--search-height` | `40px` |
| `--container-max` | `1500px` |

## Tailwind `@theme` utilities

| Utility | Maps to |
|---------|---------|
| `bg-amazon-header` | `--color-header-primary` |
| `bg-amazon-subnav` | `--color-header-secondary` |
| `bg-amazon-orange` | `--color-accent-orange` |
| `bg-amazon-yellow` | `--color-accent-yellow` |
| `bg-amazon-page` | `--color-bg-page` |
| `text-amazon-link` | `--color-text-link` |
| `text-amazon-deal` | `--color-deal` |

## TypeScript tokens (`frontend/src/design-tokens/`)

Import from `@/design-tokens`:

```ts
import { colors, spacing, typography, shadows, borderRadius } from "@/design-tokens";
```

Use TS tokens when values are needed in JavaScript (charts, inline styles, tests). For JSX styling, prefer CSS variables in Tailwind classes.

### Typography presets (`typography.product`)

| Preset | Size | Weight | Line height |
|--------|------|--------|-------------|
| `title` | 28px | 400 | 1.3 |
| `sectionHeading` | 21px | 700 | 1.3 |
| `price` | 28px | 400 | 1.2 |
| `priceDeal` | 18px | 400 | 1.3 |
| `meta` | 12px | 400 | 1.4 |
| `body` | 14px | 400 | 1.6 |

CSS equivalents: `.text-product-title`, `.text-product-section-heading`, `.text-product-price`, `.text-product-price-deal`, `.text-product-meta`.

## Semantic CSS classes

| Class | Purpose |
|-------|---------|
| `.amazon-btn-primary` | Yellow gradient CTA button |
| `.amazon-link` | Teal link with hover underline |
| `.amazon-card` | White card with shadow + hover lift |
| `.text-product-*` | Product page typography scale |
| `.amazon-zoom-lens` | Product image zoom overlay |
| `.animate-fade-in` | Entry animation |
| `.line-clamp-2` | Two-line text truncation |

## Button variants (`@/components/ui/button`)

| Variant | Use case |
|---------|----------|
| `amazon` / `default` | Primary yellow CTA |
| `secondary` | Gray secondary action |
| `outline` | White bordered button |
| `destructive` | Error/delete actions |
| `ghost` | Minimal hover background |
| `link` | Text link style |
| `amazon-dark` | Dark header-style button |

Sizes: `default`, `sm`, `lg`, `icon`.
