# Design — ClujPulse

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
atmospheric

## Macrostructure family
- App pages: Tab-bar shell (bottom nav, content area, sticky header)

## Theme
- `--color-paper`       oklch(11% 0.012 285)
- `--color-paper-2`     oklch(15% 0.014 285)
- `--color-paper-3`     oklch(19% 0.012 285)
- `--color-ink`         oklch(93% 0.006 285)
- `--color-ink-2`       oklch(62% 0.008 285)
- `--color-ink-3`       oklch(42% 0.006 285)
- `--color-rule`        oklch(22% 0.012 285)
- `--color-accent`      oklch(62% 0.22 290)
- `--color-accent-soft` oklch(18% 0.04 290)
- `--color-focus`       oklch(70% 0.18 290)
- `--color-success`     oklch(62% 0.16 155)
- `--color-warning`     oklch(72% 0.14 70)
- `--color-danger`      oklch(62% 0.18 25)

## Typography
- Display: Geist, weight 600, style normal
- Body:    Geist, weight 350
- Mono:    JetBrains Mono, weight 400
- Display tracking: -0.02em
- Type scale anchor: 14px (mobile-first utility app)

## Spacing
4-point named scale via Tailwind v4 `--spacing`. Pages use Tailwind utilities
(`p-3`, `gap-2`, `py-5`) — not raw values.

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`
- Reveal pattern: fade only, 120–150ms
- Reduced-motion fallback: opacity-only, 150ms max

## Microinteractions stance
- Silent success (no toasts, no confetti)
- Hover delay: not applicable (mobile-first)
- Tap feedback: opacity transition, no scale/bounce

## CTA voice
- Primary CTA: solid fill (`bg-ink text-paper`), pill radius, lowercase
- Secondary CTA: ghost (`bg-paper-2 border-rule text-ink-2`), pill radius

## Per-page allowances
- App pages MUST NOT use enrichment — function carries the page.
- The wallpaper exporter modal may use a canvas-generated image.

## What pages MUST share
- The wordmark "ClujPulse" in Geist 600, no gradient, no glow
- The accent colour (violet 290) at ≤5% per viewport
- The Geist + JetBrains Mono font pairing
- The CTA voice (pill shape, no gradient fills, no glow shadows)
- Stage colour dots as the only multi-hue element

## What pages MAY differ on
- Filter layout (horizontal scroll vs. wrap)
- Card density (2-col grid vs. single-col list)
- Content-specific status indicators (now-playing dot, clash warning)

## Bans
- No glow shadows (`box-shadow` with colored spread)
- No gradient text (`background-clip: text`)
- No decorative blur orbs
- No `animate-pulse` except the one "now playing" dot
- No `rounded-3xl` — max radius is 12px (`--radius-lg`)
- No `font-black` or `font-extrabold` — max weight is 600 (semibold)
- No uppercase mono labels used decoratively
- No backdrop-blur beyond the header/nav (functional blur only)
