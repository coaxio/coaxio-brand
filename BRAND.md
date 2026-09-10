# Coaxio brand guidelines

This document is normative. Where it and a design mockup disagree, this document wins.
Where it and `tokens/coaxio.tokens.json` disagree, the tokens win — they are the machine-readable
source of truth and this file explains them.

## 1. The name

Written **Coaxio**. One capital, no camel case, no all-caps.

| Correct | Wrong |
|---|---|
| Coaxio | CoaxIO, COAXIO, coaxIO |
| coaxio-forge | Coaxio Forge, CoaxioForge |
| `coaxio` (CLI binary, package names, handles) | — |

The name is a portmanteau of *coaxium* — the hyperfuel from Star Wars, chosen for the idea of a
dense, refined thing that makes everything downstream possible — and *I/O*. Pronounced
"co-AX-ee-oh".

Project names are always lowercase and hyphenated: `coaxio-forge`, not `Coaxio-Forge`.
All project content is written in English regardless of the maintainer's working language.

## 2. Positioning

> Day-zero scaffolding for homelab infrastructure.

Coaxio sits **below the PaaS layer**. It takes a bare Debian or Ubuntu host to a production-ready
homelab state: WireGuard, Caddy, Authelia, monitoring, secrets at rest. It does not deploy
applications and it is not an alternative to Coolify, Dokploy or CapRover — those run on top of
what Coaxio establishes.

This distinction governs scope decisions and it governs copy. Never describe Coaxio as a platform,
a PaaS, or a deployment tool.

## 3. Voice

Technical, direct, unembellished. The reader is a competent sysadmin who does not need
to be sold to.

- State what a thing does, then what it does not do. The second half is usually the useful half.
- No superlatives, no "effortless", no "just works", no "blazingly fast".
- Prefer the specific over the impressive: "generates a Caddyfile and an Authelia config" beats
  "handles your reverse proxy needs".
- Document limitations in the same voice as features. A known gap stated plainly builds more
  trust than a feature list.
- Sentence case everywhere, including headings and buttons.

Two examples of the difference:

> **No.** Coaxio effortlessly transforms your bare metal into a powerful, production-grade homelab
> with just one command.

> **Yes.** Coaxio generates the configuration for WireGuard, Caddy, Authelia and a Prometheus stack
> on a fresh Debian or Ubuntu host. It does not deploy your applications.

## 4. Colour

Three families, each with a distinct job. Using them interchangeably is the fastest way to make
something stop looking like Coaxio.

| Family | Anchor | Job |
|---|---|---|
| **Petrol** | `#0E1A1C` | Every surface, and all neutral text. The environment. |
| **Copper** | `#C97D4B` / `#E0955F` | Accent. Actions the reader can take, and emphasis in prose. |
| **Mint** | `#8FE3C7` | Signal. Links, live state, the signal-spine motif. Nothing decorative. |

The mint is the rule most easily broken. It reads as "this is carrying information" — a link, an
active nav item, an OK status, the spine. The moment it is used for a decorative divider or a
background wash, it stops meaning anything.

Consume the semantic tier (`color.surface.base`, `color.text.primary`), never the primitives.
`--coaxio-primitive-petrol-900` in application code is a bug: it names a value instead of a role,
so when the role reassigns, the name lies.

### Approved and prohibited pairings

`dist/CONTRAST.md` is generated on every build and lists all 54 approved combinations with measured
ratios. It is authoritative. Highlights:

- `text.primary` on `surface.base` — 16.60:1, AAA.
- `text.accent` (copper-400) on `surface.base` — 7.30:1, AAA. Use this for copper text, not
  `accent.base`, which only reaches 5.51:1.
- `text.signal` (mint-300) on `surface.base` — 11.82:1, AAA.
- `text.faint` on `surface.overlay` — 3.69:1. Large text only. Never body copy.
- `text.inverse` on `accent.active` — 3.97:1. Below AA at normal size. Acceptable only because
  the active state is transient; do not use `accent.active` as a resting fill under small text.
- `accent.subtle` is a dark fill. It pairs with `text.primary`, never `text.inverse`.

Never place copper on white: `copper-500` on `#FFFFFF` is 3.22:1, which fails AA for normal text.
Coaxio has no light theme; if one is ever added, copper has to darken to `copper-700` for text.

## 5. Typography

| Role | Family | Notes |
|---|---|---|
| Display | Space Grotesk | Headings and the wordmark. Never below 18px. |
| Body | Inter | All running copy and UI. |
| Mono | JetBrains Mono | Code, CLI output, version strings, technical labels. |

All three are licensed under the SIL Open Font License 1.1 and may be redistributed. See
`fonts/LICENSES.md`.

Scale is modular at ratio 1.25 from a 16px base. Set `letterSpacing.tight` on Space Grotesk from
`xl` upward and `tighter` from `3xl` — it is drawn loose for display use and looks unresolved
without it.

Body copy is capped at `layout.measure` (68ch), which keeps lines under 80 characters.

Two treatments to avoid, because they read as generic:

- Tracked-out all-caps eyebrow labels above headings.
- Accenting a single word in a heading in copper. If a heading needs emphasis, rewrite the heading.

## 6. The mark

The primary mark is a coaxial cable cross-section: concentric rings around a centre conductor,
with the dielectric and shield layers reading as distinct bands.

- **Clear space**: minimum `1x` on all sides, where x is the outer radius of the mark.
- **Minimum width**: 96px for the full lockup. Below that, drop the wordmark and use the mark
  alone. Below 16px, use the simplified single-ring favicon variant.
- **Variants required**: full colour on petrol, mono mint, mono petrol-50, and a knockout for
  single-colour printing.

### Misuse

Do not stretch or skew, rotate, add shadows or glows, place on a photograph, recolour outside the
approved families, outline the wordmark, or reconstruct the mark from primitives at a different
ring ratio. Do not set the wordmark in any face other than Space Grotesk.

## 7. The signal spine

A vertical or horizontal mint rule at `border.width.thick` (2px) that runs alongside content and
marks the active or current position. It is the one motion moment in the identity: it may animate
on page load or on navigation, once.

It carries meaning. A spine that decorates a section it has no relationship to is misuse.

## 8. Applications

| Surface | Notes |
|---|---|
| coaxio.dev | `surface.base` throughout. Spine in the article layout. |
| OG image | 1200×630. See `templates/og-image.svg`. |
| Favicon | 16, 32, 180 (apple-touch), 512. Simplified mark below 32. |
| GitHub profile README | Banner SVG hosted on coaxio.dev, not committed to the README repo. |
| CLI output | `dist/tokens.go` provides the hex constants and an ANSI helper. Degrade to uncoloured output when `NO_COLOR` is set or stdout is not a TTY. |
| Wallpapers | 21:9, 16:9, 16:10. Mark at low contrast, spine as the only bright element. |

## 9. Changing this

Colour and type changes go through `tokens/coaxio.tokens.json` and are released as a tagged
version. Consumers pin a tag. A change that alters a primitive is a minor version; a change that
reassigns a semantic role or removes a token is a major version, because it will silently change
meaning downstream.
