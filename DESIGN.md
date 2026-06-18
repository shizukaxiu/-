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

The project uses **semantic color tokens** defined in `src/index.css` via TailwindCSS v4 `@theme`. Legacy hue aliases (`teal-*`, `cyan-*`, `slate-*`) remain in the theme as aliases so third-party snippets or historical components keep working, but **new code should use semantic tokens**.

### Semantic Tokens

| Scale | Meaning | Key Values |
|---|---|---|
| `primary-*` | Brand / primary action | `primary-50` light tint, `primary-500` buttons, `primary-600` active states, `primary-700` hover, `primary-800` active |
| `accent-*` | Secondary / information | `accent-50` tint, `accent-500` info highlights, `accent-600` emphasis |
| `neutral-*` | Grayscale surfaces and text | `neutral-50` page bg, `neutral-200` borders, `neutral-500` secondary text, `neutral-700` body, `neutral-800` headings |
| `success-*` | Positive / completion | `success-50` bg, `success-200` border, `success-700` text, `success-800` value |
| `error-*` | Error / destructive / recording | `error-50` bg, `error-100` recording mic, `error-200` border, `error-600` recording mic, `error-700` text |
| `warning-*` | Demo / caution badge | `warning-100` bg, `warning-200` border, `warning-700` text |

### Legacy Aliases (Backward Compatible)

| Alias | Maps to |
|---|---|
| `teal-*` | `primary-*` |
| `cyan-*` | `accent-*` |
| `slate-*` | `neutral-*` |

### Usage Patterns

- **Primary actions**: solid `primary-600` with `hover:bg-primary-700` / `active:bg-primary-800`. Used for primary buttons, active sidebar item, user chat bubble, and key headers.
- **Signature gradient**: `from-primary-500 to-accent-600` is intentionally reserved for the assistant avatar / digital human, making the AI presence distinctive without overusing gradients across the UI.
- **Surfaces**: white cards and sidebars on a solid `neutral-50` background. Header and sidebars use solid white with `neutral-200` borders instead of frosted glass.
- **Borders**: `neutral-200` for neutral cards and app chrome; `primary-100`/`primary-200` for assistant chat bubbles and policy cards as brand accents.
- **Status**: `success-*` for completed/successful states, `error-*` for errors and the recording mic, `warning-*` for demo-data badges.

---

## Typography

### Font Stack

```css
font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale

| Element | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page title | `text-2xl` / 1.5rem | `font-bold` | `neutral-800` | e.g. "个人账户看板" |
| Section heading | `text-lg` / 1.125rem | `font-bold` | `neutral-900` | Header app title |
| Card title | `font-semibold` | 600 | `neutral-800` | Inside cards and forms |
| Body | `text-sm` / 0.875rem | 400 | `neutral-700` | Chat bubbles, form content |
| Caption / meta | `text-xs` / 0.75rem | 400 | `neutral-500` | Descriptions, metadata |
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
- **Header**: `px-6 py-4`, solid white background, bottom border `primary-100`.
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

- **Primary**: `bg-primary-600 text-white rounded-full` with `hover:bg-primary-700 hover:shadow-md active:bg-primary-800`. Solid color conveys authority and reduces generic gradient overuse.
- **Secondary / Ghost**: `text-neutral-500 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100` on `rounded-xl` or `rounded-lg`.
- **Active sidebar item**: solid `bg-primary-600` + white text + shadow.
- **Disabled**: `disabled:opacity-40 disabled:cursor-not-allowed`.

### Card

- **Neutral card**: `bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm`.
- **Tinted card**: `bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200` (PolicyCard).
- **Success card**: `bg-success-50 border border-success-200 rounded-xl`.
- **Overview panel**: single `bg-white` card with internal grid and subtle right-border separators (AccountDashboard), avoiding the hero-metric card grid cliché.

### Input / Textarea

- Chat textarea wrapper: `bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2`.
- Focus state: `focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100`.
- Placeholder: `text-neutral-400`.

### Chat Bubble

- **User**: gradient fill, white text, `rounded-tr-none`.
- **Assistant**: white fill, `neutral-700` text, `border border-primary-100`, `rounded-tl-none`.
- **Avatar**: `w-9 h-9 rounded-full`; user uses `bg-neutral-200`, assistant uses signature gradient.

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

`@media (prefers-reduced-motion: reduce)` is globally applied in `src/index.css` to disable `animation`, `transition`, and `scroll-behavior` for users who prefer reduced motion. Framer Motion animations still run, but CSS transitions and the digital-human ring waves are suppressed.

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
