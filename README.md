# coaxio-brand

The Coaxio identity: design tokens, brand guidelines, trademark policy and logo assets.

This is the single source of truth for Coaxio's colour, typography and spacing. Four things
consume it — coaxio.dev, coaxio-forge's CLI output, the GitHub profile README, and the
wallpaper and OG image templates — and keeping them aligned by hand does not work.

## Licensing, in short

Three different things live here under three different terms. This matters, so it is stated
before anything else:

| What | Terms |
|---|---|
| `tokens/`, `build/`, `dist/` | MIT — see `LICENSE` |
| `BRAND.md`, `TRADEMARK.md`, this file | CC BY 4.0 — see `LICENSE-DOCS` |
| The **Coaxio name and mark** | Not licensed. See `TRADEMARK.md` |

You can fork this, take the tokens, adapt the guidelines. You cannot ship your own project
called Coaxio. `TRADEMARK.md` explains where the line is and grants a lot of latitude on the
permitted side.

## Using the tokens

### npm

```sh
npm install @coaxio/tokens
```

```js
import { color, font } from '@coaxio/tokens';
color.surface.base;   // '#0E1A1C'
color.text.signal;    // '#8FE3C7'
```

```css
@import '@coaxio/tokens/css';

body {
  background: var(--coaxio-color-surface-base);
  color: var(--coaxio-color-text-primary);
  font-family: var(--coaxio-font-family-body);
  max-width: var(--coaxio-layout-measure);
}
```

Tailwind:

```js
import { coaxioTheme } from '@coaxio/tokens/tailwind';
export default { theme: { extend: coaxioTheme } };
```

### Without npm

`dist/` is committed, so any file can be fetched directly. Always pin a tag — `main` will move
under you:

```sh
curl -O https://raw.githubusercontent.com/coaxio/coaxio-brand/v0.1.0/dist/tokens.css
```

### Go

`dist/tokens.go` is a `package brand` file with hex constants and an ANSI helper, for coloured
CLI output. Copy it into `internal/brand/` in the consuming project rather than importing this
repo as a module — it is generated, has no dependencies, and vendoring it keeps coaxio-forge's
module graph clean.

```go
fmt.Println(brand.ToANSI(brand.ColorTextSignal) + "ok" + brand.Reset)
```

Respect `NO_COLOR` and check that stdout is a TTY before emitting escapes.

## Structure

```
tokens/coaxio.tokens.json    source of truth, W3C Design Tokens format
build/build.mjs              generator: zero dependencies, Node >= 18
dist/                        generated, committed
  tokens.css                 CSS custom properties
  tokens.scss                SCSS variables
  tokens.js                  nested JS object
  tokens.tailwind.js         Tailwind theme fragment
  tokens.go                  Go constants + ANSI helper
  CONTRAST.md                measured WCAG ratios for every approved pairing
BRAND.md                     the normative guidelines
TRADEMARK.md                 name and mark policy
logo/                        marks (see logo/README.md for what is still missing)
templates/og-image.svg       1200x630 social card
fonts/LICENSES.md            OFL notes, including the Reserved Font Name trap
```

## Working on it

```sh
node build/build.mjs          # regenerate dist/
node build/build.mjs --check  # exit 1 if dist/ is stale
```

Edit `tokens/coaxio.tokens.json`, never `dist/`. CI runs `--check` and fails the build if
`dist/` drifts, and separately fails if any approved colour pairing drops below 3:1.

The generator is deliberately dependency-free rather than using Style Dictionary. Five output
formats do not justify a build toolchain, and a 300-line script that anyone can read end to
end is easier to trust than a config file plus a framework.

### Three tiers

Primitives hold raw values. Semantic tokens assign roles. Component tokens pin specific uses.

Application code consumes the **semantic** tier only. Referencing
`--coaxio-primitive-petrol-900` is a bug: it names a value instead of a role, so when the role
is reassigned, the name lies. The tiers exist so that "make the copper warmer" and "accents are
mint now" are two different, both-easy edits.

### Versioning

Consumers pin tags. Changing a primitive value is a minor version. Reassigning a semantic role
or removing a token is a **major** version, because it silently changes meaning downstream.

## Related

- [coaxio.dev](https://coaxio.dev)
- coaxio-forge — CLI orchestrator for WireGuard, Caddy, Authelia and monitoring

---

Coaxio is a trademark of the Coaxio project.
