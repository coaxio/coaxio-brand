#!/usr/bin/env node
/**
 * Coaxio token generator.
 *
 * Reads tokens/coaxio.tokens.json (W3C Design Tokens format) and emits one file
 * per consumer into dist/. No dependencies: this runs on any Node >= 18 with
 * nothing installed, which matters because the outputs are committed and CI
 * only needs to verify they are current.
 *
 * Usage:
 *   node build/build.mjs          write dist/
 *   node build/build.mjs --check  exit 1 if dist/ differs from a fresh build
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'tokens/coaxio.tokens.json');
const DIST = resolve(ROOT, 'dist');
const CHECK = process.argv.includes('--check');

const RESERVED = new Set(['$schema', '$type', '$value', '$description', '$extensions', '$deprecated']);

// ---------------------------------------------------------------- flatten

/** Walk the token tree, inheriting $type from the nearest ancestor group. */
function flatten(node, path = [], inheritedType = null, out = []) {
  const type = node.$type ?? inheritedType;
  if (Object.hasOwn(node, '$value')) {
    out.push({
      path,
      type,
      value: node.$value,
      description: node.$description,
      role: node.$extensions?.['dev.coaxio.role'] ?? null,
    });
    return out;
  }
  for (const [key, child] of Object.entries(node)) {
    if (RESERVED.has(key)) continue;
    if (child === null || typeof child !== 'object' || Array.isArray(child)) continue;
    flatten(child, [...path, key], type, out);
  }
  return out;
}

// -------------------------------------------------------------- resolve

const REF = /^\{([^}]+)\}$/;

/** Resolve {a.b.c} aliases. Detects cycles and unresolvable references. */
function resolveAll(tokens) {
  const byPath = new Map(tokens.map((t) => [t.path.join('.'), t]));

  const resolveOne = (token, seen) => {
    if (typeof token.value !== 'string') return token.value;
    const m = REF.exec(token.value.trim());
    if (!m) return token.value;

    const target = m[1];
    if (seen.has(target)) {
      throw new Error(`Circular token reference: ${[...seen, target].join(' -> ')}`);
    }
    const next = byPath.get(target);
    if (!next) {
      throw new Error(`Unresolved reference {${target}} in ${token.path.join('.')}`);
    }
    seen.add(target);
    const resolved = resolveOne(next, seen);
    // Inherit the type of the alias target when the alias itself declares none.
    token.type ??= next.type;
    token.aliasOf = target;
    return resolved;
  };

  for (const token of tokens) {
    token.resolved = resolveOne(token, new Set([token.path.join('.')]));
  }
  return tokens;
}

// ------------------------------------------------------------ formatting

const kebab = (path) => path.join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const camel = (path) =>
  path
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');
const pascal = (path) =>
  path.map((p) => p.replace(/[^A-Za-z0-9]/g, '')).map((p) => p[0].toUpperCase() + p.slice(1)).join('');

/** Render a token value as a CSS-ready string. */
function cssValue(token) {
  const v = token.resolved;
  if (Array.isArray(v)) {
    if (token.type === 'fontFamily') {
      return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
    }
    if (token.type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`;
    return v.join(' ');
  }
  return String(v);
}

const BANNER = (comment) => {
  const lines = [
    'Coaxio design tokens — GENERATED FILE, DO NOT EDIT.',
    'Source: tokens/coaxio.tokens.json',
    'Regenerate: node build/build.mjs',
  ];
  return lines.map((l) => `${comment} ${l}`).join('\n') + '\n\n';
};

// -------------------------------------------------------------- emitters

function emitCss(tokens) {
  let out = BANNER('/*').replace(/\/\* /g, '/* ').replace(/\n\n$/, ' */\n\n');
  out = '/*\n' + [
    ' * Coaxio design tokens — GENERATED FILE, DO NOT EDIT.',
    ' * Source: tokens/coaxio.tokens.json',
    ' * Regenerate: node build/build.mjs',
  ].join('\n') + '\n */\n\n:root {\n';

  let lastGroup = null;
  for (const t of tokens) {
    const group = t.path[0];
    if (group !== lastGroup) {
      out += lastGroup === null ? '' : '\n';
      out += `  /* ${group} */\n`;
      lastGroup = group;
    }
    const comment = t.description ? `  /* ${t.description} */` : '';
    out += `  --coaxio-${kebab(t.path)}: ${cssValue(t)};${comment}\n`;
  }
  out += '}\n';
  return out;
}

function emitScss(tokens) {
  let out = BANNER('//');
  for (const t of tokens) {
    if (t.description) out += `// ${t.description}\n`;
    out += `$coaxio-${kebab(t.path)}: ${cssValue(t)};\n`;
  }
  return out;
}

function emitJs(tokens) {
  const tree = {};
  for (const t of tokens) {
    let node = tree;
    for (const key of t.path.slice(0, -1)) node = node[key] ??= {};
    node[t.path.at(-1)] = t.resolved;
  }
  return (
    BANNER('//') +
    `export const tokens = ${JSON.stringify(tree, null, 2)};\n\nexport default tokens;\n`
  );
}

function emitTailwind(tokens) {
  const pick = (prefix) =>
    Object.fromEntries(
      tokens
        .filter((t) => t.path[0] === prefix)
        .map((t) => [t.path.slice(1).join('-'), Array.isArray(t.resolved) ? cssValue(t) : t.resolved]),
    );

  const config = {
    colors: pick('color'),
    spacing: pick('space'),
    borderRadius: pick('radius'),
    fontSize: Object.fromEntries(
      tokens.filter((t) => t.path[0] === 'font' && t.path[1] === 'size').map((t) => [t.path[2], t.resolved]),
    ),
    fontFamily: Object.fromEntries(
      tokens
        .filter((t) => t.path[0] === 'font' && t.path[1] === 'family')
        .map((t) => [t.path[2], t.resolved]),
    ),
    maxWidth: pick('layout'),
  };

  return (
    BANNER('//') +
    '/** Drop into tailwind.config.js under `theme.extend`. */\n' +
    `export const coaxioTheme = ${JSON.stringify(config, null, 2)};\n\nexport default coaxioTheme;\n`
  );
}

function emitGo(tokens) {
  const wanted = tokens.filter(
    (t) => t.type === 'color' || (t.path[0] === 'brand' && t.type === 'string'),
  );

  let out = BANNER('//');
  out += 'package brand\n\n';
  out += '// Hex values are suitable for 24-bit ANSI escape sequences in CLI output.\n';
  out += '// Use ToANSI to build a foreground sequence.\n\nconst (\n';

  const width = Math.max(...wanted.map((t) => pascal(t.path).length));
  for (const t of wanted) {
    const name = pascal(t.path);
    const comment = t.description ? ` // ${t.description}` : '';
    out += `\t${name.padEnd(width)} = ${JSON.stringify(t.resolved)}${comment}\n`;
  }
  out += ')\n\n';
  out += `// ToANSI converts a token hex string such as "#8FE3C7" into a 24-bit
// foreground escape sequence. It returns an empty string for malformed input
// so that callers degrade to uncoloured output rather than emitting garbage.
func ToANSI(hex string) string {
\tif len(hex) != 7 || hex[0] != '#' {
\t\treturn ""
\t}
\tvar rgb [3]int
\tfor i := 0; i < 3; i++ {
\t\tfor j := 0; j < 2; j++ {
\t\t\tc := hex[1+i*2+j]
\t\t\tvar v int
\t\t\tswitch {
\t\t\tcase c >= '0' && c <= '9':
\t\t\t\tv = int(c - '0')
\t\t\tcase c >= 'a' && c <= 'f':
\t\t\t\tv = int(c-'a') + 10
\t\t\tcase c >= 'A' && c <= 'F':
\t\t\t\tv = int(c-'A') + 10
\t\t\tdefault:
\t\t\t\treturn ""
\t\t\t}
\t\t\trgb[i] = rgb[i]*16 + v
\t\t}
\t}
\treturn "\\x1b[38;2;" + itoa(rgb[0]) + ";" + itoa(rgb[1]) + ";" + itoa(rgb[2]) + "m"
}

// Reset ends any active ANSI colour sequence.
const Reset = "\\x1b[0m"

func itoa(n int) string {
\tif n == 0 {
\t\treturn "0"
\t}
\tvar buf [3]byte
\ti := len(buf)
\tfor n > 0 {
\t\ti--
\t\tbuf[i] = byte('0' + n%10)
\t\tn /= 10
\t}
\treturn string(buf[i:])
}
`;
  return out;
}

// ------------------------------------------------------- contrast report

const srgbToLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * Every foreground token is checked against every surface token. This is the
 * part of the brand guidelines that is worth automating: a ratio in a PDF goes
 * stale silently, a failing check does not.
 */
function emitContrastReport(tokens) {
  const isHex = (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
  const colours = tokens.filter((t) => t.path[0] === 'color' && isHex(t.resolved));
  const surfaces = colours.filter((t) => t.path[1] === 'surface');
  const fills = colours.filter((t) => t.role === 'fill');
  const onFill = colours.filter((t) => t.role === 'on-fill');
  const foregrounds = colours.filter(
    (t) => ['text', 'accent', 'signal', 'feedback'].includes(t.path[1]) && !t.role,
  );
  // Signal and mint fills also carry text, so they belong in the fill table too.
  const textBearingFills = [...fills, ...colours.filter((t) => t.path[1] === 'signal' && t.path[2] === 'base')];

  const measure = (fg, bg) => {
    const ratio = contrast(fg.resolved, bg.resolved);
    return {
      fg: fg.path.join('.'),
      bg: bg.path.join('.'),
      ratio: Math.round(ratio * 100) / 100,
      normalAA: ratio >= 4.5,
      normalAAA: ratio >= 7,
      largeAA: ratio >= 3,
    };
  };

  const darkFills = colours.filter((t) => t.role === 'fill-dark');
  const lightText = colours.filter((t) => ['primary', 'secondary'].includes(t.path[2]) && t.path[1] === 'text');

  const onSurface = surfaces.flatMap((s) => foregrounds.map((f) => measure(f, s)));
  const onFills = [
    ...textBearingFills.flatMap((b) => onFill.map((f) => measure(f, b))),
    ...darkFills.flatMap((b) => lightText.map((f) => measure(f, b))),
  ];

  const mark = (b) => (b ? 'pass' : 'FAIL');
  const table = (rows) => {
    let t = '| Foreground | Background | Ratio | Normal AA | Normal AAA | Large AA |\n';
    t += '|---|---|--:|:-:|:-:|:-:|\n';
    for (const r of rows.sort((a, b) => a.bg.localeCompare(b.bg) || b.ratio - a.ratio)) {
      t += `| \`${r.fg}\` | \`${r.bg}\` | ${r.ratio.toFixed(2)} | ${mark(r.normalAA)} | ${mark(r.normalAAA)} | ${mark(r.largeAA)} |\n`;
    }
    return t;
  };

  let md = '# Contrast report\n\n';
  md += 'Generated by `build/build.mjs`. Ratios are WCAG 2.1 relative luminance.\n';
  md += 'Normal text needs 4.5:1 for AA and 7:1 for AAA. Large text (at least 18.66px bold or 24px regular) needs 3:1 for AA.\n\n';
  md += 'Tokens tagged `dev.coaxio.role: fill` are backgrounds, not text colours, so they are excluded from the first table. ';
  md += 'Tokens tagged `on-fill` are only ever placed on those fills, so they appear only in the second.\n\n';
  md += '## Foreground on surface\n\n' + table(onSurface);
  md += '\n## On-fill text on accent and signal fills\n\n' + table(onFills);

  const failing = [...onSurface, ...onFills].filter((r) => !r.largeAA);
  md += `\n## Summary\n\n${onSurface.length + onFills.length} pairs checked. ${failing.length} below the 3:1 large-text floor.\n`;
  if (failing.length) {
    md += '\nThese combinations are prohibited at any size:\n\n';
    for (const r of failing) md += `- \`${r.fg}\` on \`${r.bg}\` (${r.ratio.toFixed(2)}:1)\n`;
  } else {
    md += '\nEvery approved combination clears the large-text floor. See the tables above for which clear AA and AAA at normal size.\n';
  }
  return md;
}

// ------------------------------------------------------------------ main

function main() {
  const source = JSON.parse(readFileSync(SRC, 'utf8'));
  const tokens = resolveAll(flatten(source));

  const outputs = {
    'tokens.css': emitCss(tokens),
    'tokens.scss': emitScss(tokens),
    'tokens.js': emitJs(tokens),
    'tokens.tailwind.js': emitTailwind(tokens),
    'tokens.go': emitGo(tokens),
    'CONTRAST.md': emitContrastReport(tokens),
  };

  if (CHECK) {
    let drifted = [];
    for (const [name, content] of Object.entries(outputs)) {
      const path = resolve(DIST, name);
      if (!existsSync(path) || readFileSync(path, 'utf8') !== content) drifted.push(name);
    }
    if (drifted.length) {
      console.error(`dist/ is stale: ${drifted.join(', ')}`);
      console.error('Run `node build/build.mjs` and commit the result.');
      process.exit(1);
    }
    console.log(`dist/ is current (${tokens.length} tokens).`);
    return;
  }

  mkdirSync(DIST, { recursive: true });
  for (const [name, content] of Object.entries(outputs)) {
    writeFileSync(resolve(DIST, name), content);
    console.log(`wrote dist/${name}`);
  }
  console.log(`${tokens.length} tokens resolved.`);
}

main();
