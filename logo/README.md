# Logo assets

Empty until the mark is finalised. Committing a placeholder is worse than
committing nothing: the moment a file lands here, someone will treat it as the
logo.

## Required before this directory is considered complete

```
svg/
  coaxio-lockup.svg           mark + wordmark, horizontal
  coaxio-lockup-stacked.svg   mark above wordmark
  coaxio-mark.svg             mark alone
  coaxio-mark-simple.svg      single-ring variant for 16-32px
  coaxio-mark-mono-mint.svg
  coaxio-mark-mono-light.svg
  coaxio-mark-knockout.svg    single-colour print
png/
  coaxio-mark-{32,64,128,256,512,1024}.png
  coaxio-lockup-{512,1024,2048}.png
  favicon-{16,32}.png
  apple-touch-icon-180.png
```

## Rules that apply to every file here

- Geometry per `brand.logo` in `tokens/coaxio.tokens.json`: clear space `1x`,
  lockup minimum 96px, mark minimum 16px.
- SVGs carry no embedded raster, no `<style>` blocks, and no font references —
  the wordmark ships as outlined paths so it renders identically everywhere.
- Colours as literal hex from the token values, not CSS variables. These files
  are consumed outside any stylesheet.
- Run every SVG through an optimiser before committing, and keep the `viewBox`.

See BRAND.md section 6 for clear space, minimum sizes and misuse.
