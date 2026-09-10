# Font licences

Coaxio uses three typefaces, all under the SIL Open Font License 1.1. No font
binaries are committed here; each is loaded from the source below.

| Family | Role | Licence | Source |
|---|---|---|---|
| Space Grotesk | Display, wordmark | OFL 1.1 | https://github.com/floriankarsten/space-grotesk |
| Inter | Body, UI | OFL 1.1 | https://github.com/rsms/inter |
| JetBrains Mono | Code, CLI | OFL 1.1 | https://github.com/JetBrains/JetBrainsMono |

## What OFL 1.1 permits

Redistribution, embedding in documents and applications, bundling with
software, and commercial use — including as part of a paid product.

## The one constraint that matters here

OFL 1.1 has a Reserved Font Name clause. If any of these fonts is ever modified
(subsetted with edits, hinting changed, glyphs added), the result must NOT be
distributed under the original family name. A subset that only removes glyphs
without altering them is not a modification for this purpose, so ordinary web
subsetting is fine.

Practical consequence: if a custom wordmark is drawn from Space Grotesk
outlines, convert it to paths and treat it as artwork. Do not ship it as a font
called "Space Grotesk" anything.
