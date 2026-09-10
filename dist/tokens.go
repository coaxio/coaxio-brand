// Coaxio design tokens — GENERATED FILE, DO NOT EDIT.
// Source: tokens/coaxio.tokens.json
// Regenerate: node build/build.mjs

package brand

// Hex values are suitable for 24-bit ANSI escape sequences in CLI output.
// Use ToANSI to build a foreground sequence.

const (
	PrimitivePetrol50      = "#F4F8F9"
	PrimitivePetrol100     = "#E1EDEF"
	PrimitivePetrol200     = "#C6DDE1"
	PrimitivePetrol300     = "#9CC7CE"
	PrimitivePetrol400     = "#6DB0BB"
	PrimitivePetrol500     = "#478E9A"
	PrimitivePetrol600     = "#35666E"
	PrimitivePetrol700     = "#27474C"
	PrimitivePetrol800     = "#1B3034"
	PrimitivePetrol850     = "#142426"
	PrimitivePetrol900     = "#0E1A1C" // Brand anchor. Page background.
	PrimitivePetrol950     = "#080E0F"
	PrimitiveCopper200     = "#EBD2C2"
	PrimitiveCopper300     = "#DEB091"
	PrimitiveCopper400     = "#E0955F" // Brand anchor. Hover/active state of copper-500.
	PrimitiveCopper500     = "#C97D4B" // Brand anchor. 5.51:1 on petrol-900 (AA text, not AAA).
	PrimitiveCopper600     = "#B3622D"
	PrimitiveCopper700     = "#884D26"
	PrimitiveMint100       = "#E0F5EE"
	PrimitiveMint200       = "#BFEDDE"
	PrimitiveMint300       = "#8FE3C7" // Brand anchor. 11.82:1 on petrol-900.
	PrimitiveMint400       = "#7BE0BE"
	PrimitiveMint500       = "#4DDBAB"
	PrimitiveMint600       = "#26C08C"
	PrimitiveStatusDanger  = "#E06C5A"
	PrimitiveStatusWarning = "#E0B65F"
	PrimitiveStatusSuccess = "#8FE3C7" // Intentionally the same as mint-300: in Coaxio, success IS signal.
	ColorSurfaceBase       = "#0E1A1C" // Page background. Never use as a text colour.
	ColorSurfaceRaised     = "#142426" // Cards, panels, code blocks.
	ColorSurfaceSunken     = "#080E0F" // Insets, terminal blocks, footer.
	ColorSurfaceOverlay    = "#1B3034" // Modals, dropdowns, tooltips.
	ColorTextPrimary       = "#F4F8F9" // Body copy on surface.base. 16.60:1 — AAA.
	ColorTextSecondary     = "#C6DDE1" // Supporting copy. 12.53:1 — AAA.
	ColorTextMuted         = "#6DB0BB" // Metadata, captions. 7.25:1 — AAA at normal size.
	ColorTextFaint         = "#478E9A" // Disabled, placeholders. 4.74:1 — AA only. Never for body copy.
	ColorTextInverse       = "#0E1A1C" // For use on mint or copper fills.
	ColorTextAccent        = "#E0955F" // Emphasis in running text. 7.30:1 — AAA.
	ColorTextSignal        = "#8FE3C7" // Links, active nav. 11.82:1 — AAA.
	ColorAccentBase        = "#C97D4B" // Primary CTA fills, active borders. Pair with text.inverse.
	ColorAccentHover       = "#E0955F"
	ColorAccentActive      = "#B3622D"
	ColorAccentSubtle      = "#884D26" // Low-emphasis accent fills and tinted borders. A dark fill: pair with text.primary, never with text.inverse.
	ColorSignalBase        = "#8FE3C7" // Links, the signal-spine motif, live/OK indicators. Not a general-purpose accent.
	ColorSignalHover       = "#BFEDDE"
	ColorSignalDim         = "#26C08C"
	ColorBorderSubtle      = "#1B3034" // Default hairlines and dividers.
	ColorBorderStrong      = "#27474C" // Input borders, card outlines.
	ColorBorderFocus       = "#8FE3C7" // Keyboard focus ring. Never remove without replacement.
	ColorFeedbackDanger    = "#E06C5A"
	ColorFeedbackWarning   = "#E0B65F"
	ColorFeedbackSuccess   = "#8FE3C7"
	BrandName              = "Coaxio"
	BrandDomain            = "coaxio.dev"
	BrandTagline           = "Day-zero scaffolding for homelab infrastructure"
	BrandLogoClearSpace    = "1x" // Minimum clear space on all sides, where x = the outer radius of the coax cross-section mark.
)

// ToANSI converts a token hex string such as "#8FE3C7" into a 24-bit
// foreground escape sequence. It returns an empty string for malformed input
// so that callers degrade to uncoloured output rather than emitting garbage.
func ToANSI(hex string) string {
	if len(hex) != 7 || hex[0] != '#' {
		return ""
	}
	var rgb [3]int
	for i := 0; i < 3; i++ {
		for j := 0; j < 2; j++ {
			c := hex[1+i*2+j]
			var v int
			switch {
			case c >= '0' && c <= '9':
				v = int(c - '0')
			case c >= 'a' && c <= 'f':
				v = int(c-'a') + 10
			case c >= 'A' && c <= 'F':
				v = int(c-'A') + 10
			default:
				return ""
			}
			rgb[i] = rgb[i]*16 + v
		}
	}
	return "\x1b[38;2;" + itoa(rgb[0]) + ";" + itoa(rgb[1]) + ";" + itoa(rgb[2]) + "m"
}

// Reset ends any active ANSI colour sequence.
const Reset = "\x1b[0m"

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var buf [3]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}
