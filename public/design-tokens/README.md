# Ivy color reference

The approved palette contains **360 swatches in 30 families**, transcribed from
**IVY Design (Copy).pdf**, page 1. The source file path and SHA-256 checksum are
recorded in `colors.json` for traceability.

## Files

- `colors.json`: canonical palette, preserving the PDF's family names, shade numbers,
  exact hexadecimal values, core/extended grouping, and primary shade (500).
- `colors.css`: generated CSS custom properties, prefixed with `--ivy-color-` to avoid
  overwriting the existing stylesheets' variables.
- `generate_css.py`: standard-library Python generator and consistency checker.

## Use

Load the stylesheet in pages that use these variables (already loaded by
`collections-index-chat-version.html`):

```html
<link rel="stylesheet" href="design-tokens/colors.css" />
```

```css
.example {
  color: var(--ivy-color-gray-700);
  background: var(--ivy-color-purple-50);
  border: 1px solid var(--ivy-color-purple-100);
}
```

Token format: `--ivy-color-<family>-<shade>`.
Every family has shades **25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950**.

**Core:** gray, error, indigo, purple, pink, rose, orange, warning, success,
bluegray, bluelight, blue.

**Extended:** brown, stone, olive, slate, zinc, steel, midnight, cyan, teal,
green, emerald, lime, yellow, coral, maroon, violet, fuchsia, magenta.

The PDF does not define semantic roles such as `brand`, or separate pure-white and
pure-black tokens. Do not silently add those or substitute a framework palette.
Use an appropriate approved swatch when adding or changing interface colors.
The examples above illustrate syntax, not mandatory semantic assignments.

## Future changes

Use this palette for new or changed interface color declarations. The collections index has been migrated to palette variables, including an
index-only utility override in `styles/collections-index-colors.css`. Other pages
retain their existing styling until a migration is requested. Existing utility classes
are usable only when their resolved color matches the intended approved swatch.
Keep third-party source logos in their supplied brand colors; those assets do not
define additional interface colors.

Do not introduce arbitrary hex/RGB/HSL values, new tints, or ad-hoc translucent
variants. `transparent`, `currentColor`, and inheritance can be used where they do
not introduce another color. If a new palette value is explicitly approved,
update the JSON and regenerate the CSS together.

```sh
python3 design-tokens/generate_css.py
python3 design-tokens/generate_css.py --check
```

## Collections index migration

`styles/collections-index-colors.css` is loaded after the shared stylesheets and
the palette. It overrides colors for the index without changing other mock pages.
The index’s inline styles and generated UI also use palette variables.

Primary brand accents use the user-approved `--ivy-color-primary` (`#465FFF`); other legacy brand shades use Indigo; named family/shade utilities use their matching
PDF swatches. White surfaces use Gray 25. Decorative shadows use Gray 200.
`index-color-mapping.json` records source-color mappings from this migration.
Keep future index changes in sync with the palette rather than adding raw colors.

## User-approved primary color

On September 18, 2026, the primary color was explicitly set to `#465FFF`
(`rgb(70, 95, 255)`). It is recorded separately from the PDF swatches in
`colors.json` under `approvedOverrides` and generated as `--ivy-color-primary`.
Use this token for primary button backgrounds and primary brand accents.
