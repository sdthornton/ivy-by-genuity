# Ivy Offline Mocks project guidance

## Approved colors

- For all future UI work in this workspace, use only the color swatches in
  `design-tokens/colors.json`, extracted from the user's IVY Design (Copy).pdf.
  Read `design-tokens/README.md` before changing interface colors.
- Prefer CSS variables from `design-tokens/colors.css`, named
  `--ivy-color-<family>-<shade>`. Load this stylesheet on a page before using them.
- Do not invent color values or rely on framework/default palette values. Reuse
  utility classes only after verifying their resolved colors against this palette.
- Do not add unapproved shades, alpha variants, or inferred brand/semantic colors.
  `transparent`, `currentColor`, and inherited colors are permitted as appropriate.
- Preserve supplied third-party logos and images; do not recolor their intrinsic
  brand colors or treat those colors as additional UI palette values.
- This is a forward-looking constraint: leave untouched legacy styling alone.
  When changing a UI color, select a palette token. Do not perform a blanket
  recoloring unless the user requests it.
- `colors.json` is canonical. After an explicitly requested palette change,
  regenerate with `python3 design-tokens/generate_css.py` and verify with
  `python3 design-tokens/generate_css.py --check`.

## Category reference

- Use `design-tokens/categories.json` for approved category names and pill colors. Read the category section of `design-tokens/README.md` before changing category UI.
- Prefer the shared `IvyCategories.createPill` helper and generated `categories.css`; regenerate with `python3 design-tokens/generate_categories.py` after dataset changes.
