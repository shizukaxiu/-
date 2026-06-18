# DESIGN.md — 医保经办助手

> Visual system for the 医保经办助手 React + TailwindCSS v4 frontend. Captures the current design tokens, components, and responsive strategy.

---

## Overview

A light, clean product UI built around a conversational chat experience. The visual language uses an authoritative teal primary on a neutral slate background, with rounded surfaces and restrained motion. The layout is app-shell driven: a persistent sidebar for tool switching, a top header for context, and a main content area that hosts chat, dashboard, invoice upload, or nearby-institution views.

Heavy dependencies (`recharts`, `tesseract.js`) are lazy-loaded so the main bundle stays lean and the first chat screen loads quickly.

- **Register**: product
- **Theme**: light (no dark mode currently)
- **Density**: medium
- **Personality**: professional, trustworthy, calm

---

## Color Palette

### Primary

| Token | Value | Usage |
|---|---|---|
| `--color-teal-500` | `#14b8a6` | Primary buttons, active states, chart stroke |
| `--color-teal-600` | `#0d9488` | Hover states, emphasis |
| `--color-cyan-500` | `#06b6d4` | Gradient partner, secondary accents |
| `--color-cyan-600` | `#0891b2` | Gradient end, emphasis |

### Neutrals

| Token | Value | Usage |
|---|---|---|
| `--color-slate-50` | `#f8fafc` | Page backgrounds, input backgrounds |
| `--color-slate-100` | `#f1f5f9` | Borders, dividers, hover backgrounds |
| `--color-slate-200` | `#e2e8f0` | Stronger borders, disabled states |
| `--color-slate-400` | `#94a3b8` | Placeholder text, secondary labels |
| `--color-slate-500` | `#64748b` | Body text, descriptions |
| `--color-slate-600` | `#475569` | Primary body text |
| `--color-slate-700` | `#334155` | Headings, strong text |
| `--color-slate-800` | `#1e293b` | Page titles |
| `--color-slate-900` | `#0f172a` | Top-level headings |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--color-amber-100` | `#fef3c7` | Demo data badge background |
| `--color-amber-200` | `#fde68a` | Demo data badge border |
| `--color-amber-700` | `#b45309` | Demo data badge text |
| `--color-green-50` | `#f0fdf4` | Success card background |
| `--color-green-200` | `#bbf7d0` | Success card border |
| `--color-green-700` | `#15803d` | Success card text |
| `--color-green-800` | `#166534` | Success card value |
| `--color-red-50` | `#fef2f2` | Error background |
| `--color-red-100` | `#fee2e2` | Recording mic background |
| `--color-red-200` | `#fecaca` | Error border |
| `--color-red-600` | `#dc2626` | Recording mic, hover text |
| `--color-red-700` | `#b91c1c` | Error text |

### Usage Patterns

- **Primary actions**: solid `teal-600` with `hover:bg-teal-700` / `active:bg-teal-800`. Used for primary buttons, active sidebar item, user chat bubble, and key headers.
- **Signature gradient**: `from-teal-500 to-cyan-600` is intentionally reserved for the assistant avatar / digital human, making the AI presence distinctive without overusing gradients across the UI.
- **Surfaces**: white cards and sidebars on a solid `slate-50` background. Header and sidebars use solid white with `slate-200` borders instead of frosted glass.
- **Borders**: `slate-200` for neutral cards and app chrome; `teal-100`/`teal-200` for assistant chat bubbles and policy cards as brand accents.

---

## Typography

### Font Stack

```css
font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale

| Element | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page title | `text-2xl` / 1.5rem | `font-bold` | `slate-800` | e.g. "个人账户看板" |
| Section heading | `text-lg` / 1.125rem | `font-bold` | `slate-900` | Header app title |
| Card title | `font-semibold` | 600 | `slate-800` | Inside cards and forms |
| Body | `text-sm` / 0.875rem | 400 | `slate-700` | Chat bubbles, form content |
| Caption / meta | `text-xs` / 0.75rem | 400 | `slate-500` | Descriptions, metadata |
| Tiny | `text-[10px]` / 0.625rem | 500 | varies | Tags, hints, trend labels |

### Line Length

- Chat bubbles capped at `max-w-[80%]`.
- Dashboard content capped at `max-w-5xl`.
- Invoice and nearby pages capped at `max-w-3xl`.

---

## Spacing & Layout

### App Shell

```
┌─────────────────────────────────────────────┐
│ Sidebar │ Header (app title + demo badge)   │
│  (w-20  │                                    │
│   lg:64)├────────────────────────────────────┤
│         │ Main content area                  │
│         │                                    │
└─────────┴────────────────────────────────────┘
```

- **Sidebar**: `w-20` on small screens, `lg:w-64` on desktop. Icon-only on small screens, icon + label on desktop.
- **Header**: `px-6 py-4`, frosted glass, bottom border `teal-100`.
- **Main**: `flex-1 flex flex-col min-w-0 overflow-hidden`.

### Page Padding

- Default content padding: `p-4 lg:p-6`.
- Dashboard grid gap: `gap-4`.
- Section spacing: `space-y-6`.

### Border Radius

| Element | Radius | Notes |
|---|---|---|
| Buttons / tags | `rounded-full` | Send button, mic button, trend badges |
| Cards / inputs | `rounded-2xl` | Chat bubbles, stat cards, upload dropzone |
| Small pills | `rounded-xl` | Policy cards, success cards, quick question buttons |
| Avatar / icons | `rounded-lg` | Square icon containers |

---

## Components

### Button

- **Primary**: `bg-teal-600 text-white rounded-full` with `hover:bg-teal-700 hover:shadow-md active:bg-teal-800`. Solid color conveys authority and reduces generic gradient overuse.
- **Secondary / Ghost**: `text-slate-500 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100` on `rounded-xl` or `rounded-lg`.
- **Active sidebar item**: solid `bg-teal-600` + white text + shadow.
- **Disabled**: `disabled:opacity-40 disabled:cursor-not-allowed`.

### Card

- **Neutral card**: `bg-white rounded-2xl border border-slate-200 p-5 shadow-sm`.
- **Tinted card**: `bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200` (PolicyCard).
- **Success card**: `bg-green-50 border border-green-200 rounded-xl`.
- **Overview panel**: single `bg-white` card with internal grid and subtle right-border separators (AccountDashboard), avoiding the hero-metric card grid cliché.

### Input / Textarea

- Chat textarea wrapper: `bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2`.
- Focus state: `focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100`.
- Placeholder: `text-slate-400`.

### Chat Bubble

- **User**: gradient fill, white text, `rounded-tr-none`.
- **Assistant**: white fill, `slate-700` text, `border border-teal-100`, `rounded-tl-none`.
- **Avatar**: `w-9 h-9 rounded-full`; user uses `bg-slate-200`, assistant uses signature gradient.

### PolicyCard

- Gradient tinted background, `FileText` icon, title with `line-clamp-2`, source/date metadata, optional external link.

### Digital Human

- Circular avatar with teal/cyan gradient waves when `isSpeaking`.
- Size: `w-28 h-28` mobile, `lg:w-36 lg:h-36` desktop.

---

## Motion

### Entrance Animations

- Chat bubbles: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`.
- Cards / forms: `initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}`.
- Nearby list items: staggered `delay: idx * 0.05`.

### Loading & Feedback

- Typing indicator: three bouncing dots with `animate-bounce` and staggered delays.
- OCR loading: spinning `Loader2` with overlay.
- Digital human speaking: scaling ring waves, `duration: 1.5, repeat: Infinity`.

### Transitions

- Sidebar / buttons: `transition-all duration-200`.
- Hover: `transition-colors`, `hover:shadow-md`.

### Reduced Motion

Currently no explicit `prefers-reduced-motion` handling. This should be added for accessibility compliance.

---

## Responsive Strategy

### Breakpoints

- `lg` (1024px+): full sidebar labels, right-side digital human panel, nearby map panel.
- `< lg`: icon-only sidebar, digital human hidden, nearby map hidden.

### Mobile Adaptations

- **Chat page**: right digital human panel hidden; a horizontal scrollable quick-question chip row appears above the input.
- **Account dashboard**: overview panel collapses from 4 columns to 2 to 1; chart and table remain usable.
- **Nearby page**: map panel hidden on mobile; list remains usable with ≥ 44px touch targets.
- **Sidebar**: icon-only on mobile with `title`/`aria-label` for discoverability.

### Touch Targets

All primary interactive elements target **≥ 44×44 px**. Buttons use `min-h-[44px]` / `min-w-[44px]` where the visual size alone would be smaller.

---

## Assets

- **Icons**: Lucide React.
- **Images**: `src/assets/hero.png` (unused in current App), `src/assets/react.svg`, `src/assets/vite.svg`.
- **Digital human avatar**: inline SVG silhouette.

---

## Performance Strategy

- **Code splitting**: non-chat tools (`AccountDashboard`, `InvoiceUploader`, `NearbyPage`) are lazy-loaded via `React.lazy`. `recharts` and `tesseract.js` only load when the user navigates to the account or invoice pages.
- **Dynamic imports**: `@xenova/transformers` is already dynamically imported in `embedding.ts` (build-time only). `tesseract.js` is dynamically imported inside `initOCRWorker()`.
- **Target**: main JS bundle < 500 KB after minification; achieved after splitting.

## Areas for Improvement

1. ~~**Color refinement**: several surfaces use low-contrast text; verify WCAG AA ratios.~~ *Addressed in polish pass.*
2. ~~**Motion accessibility**: add `prefers-reduced-motion` fallbacks.~~ *Addressed.*
3. ~~**Mobile UX**: quick questions now available on mobile.~~ *Addressed.*
4. ~~**Visual consistency**: cards and borders standardized.~~ *Addressed.*
5. ~~**Focus indicators**: global `:focus-visible` added.~~ *Addressed.*
6. ~~**Empty / error states**: retry action and empty states added.~~ *Addressed.*
7. **Bundle optimization**: heavy libraries are split; could further split `framer-motion` or add a loading skeleton if needed.
8. **Dark mode**: not currently implemented; evaluate if the product needs it.
