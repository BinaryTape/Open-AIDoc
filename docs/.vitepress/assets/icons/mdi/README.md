# Material Design Icons

SVG files made from [`@iconify-json/mdi`](https://www.npmjs.com/package/@iconify-json/mdi)
1.2.3 (already a dependency): the icon's path, wrapped in a 24 × 24 `<svg>` with a
source comment. Material Design Icons are licensed under the Apache License 2.0; see
`LICENSE.txt` in this directory.

Material for MkDocs draws its admonitions and navigation status with these icons. Each
file draws the same shape as the one on docs.koog.ai (compared pixel by pixel,
2026-10-29), used for the MkDocs admonitions in `styles/mk-admonition.css`:

| File | Used for |
|---|---|
| `pencil-circle.svg` | `note` (and a block of any unknown type) |
| `clipboard-text.svg` | `abstract`, `summary`, `tldr` |
| `information.svg` | `info`, `todo` |
| `fire.svg` | `tip`, `hint`, `important` |
| `check.svg` | `success`, `check`, `done` |
| `help-circle.svg` | `question`, `help`, `faq` |
| `alert.svg` | `warning`, `caution`, `attention` |
| `close.svg` | `failure`, `fail`, `missing` |
| `lightning-bolt-circle.svg` | `danger`, `error` |
| `shield-bug.svg` | `bug` |
| `test-tube.svg` | `example` |
| `format-quote-close.svg` | `quote`, `cite` |
| `beta.svg` | Koog's `beta` admonition, and the β after a beta page in the sidebar |
| `chevron-right.svg` | Collapsible admonitions (`???`), turned 90° when open |
