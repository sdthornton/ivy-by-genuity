# Assistant creation mock

Open `../workflow-new.html`, or choose **New workflow** on `../workflows.html`.
No development server or package installation is needed to open the checked-in page.

This is a focused import of the assistant creation/show component from
`/Users/samuelthornton/genuity/ivy-by-genuity`. Only its recursively referenced
components, mock flow data, utility code, and assets were copied. Original
classes, attributes, flow interactions, settings, and chat simulation are retained.

## Isolation and current design rules

The outer page reuses the current offline mock's navigation. The Vue builder runs
in its own iframe document, including dropdowns and settings teleported to `body`.
Its old CSS cannot enter the parent document or affect any other page. No shared
workspace stylesheet or source-project file is changed.

The builder loads the current workspace's utility stylesheet, palette and category
styles. `src/compatibility.css` supplies the source's Bootstrap-style class names
without loading Bootstrap. Spacing uses the current four-pixel scale; typography
uses the current 12/14/16px sizes and larger heading sizes. Imported UI colors are
mapped to approved tokens during the build; `palette-map.json` records that mapping.
Supplied SVGs and third-party logos are preserved as assets. Settings categories
use `design-tokens/categories.js` and the current single-category taxonomy.

`src/page-adapter.css` only adjusts positioning that previously assumed the
original project's navigation offsets. It also connects the retained settings
category classes to the canonical category styles. The component source retains
the old styles for fidelity; only the generated, palette-normalized `builder.css`
is served. Edit the source and rebuild rather than editing generated files.

## Build

Run `node v2/assistant-creation/build.mjs` from the workspace root. The build reuses
the installed, read-only toolchain in the source project by default. To use another
installed toolchain, set `IVY_BUILDER_TOOLCHAIN` to its project path. Alternatively,
install this folder's package dependencies locally. `colorjs.io`, `postcss`, and `@babel/parser` are
also required by the build-time palette mapping (already present in the source
toolchain).

The generated classic-script bundle embeds its imported assets, so the page works
with local-file previews. The source project remains unchanged. Google Fonts is
used for Outfit, consistent with the existing mock pages.

The imported builder is still an offline prototype: its conversation is scripted;
run, preview, and save buttons retain the source mock's behavior. It does not
connect to Ivy services or execute real workflows.

The build parses JavaScript before converting inline color values. It leaves
embedded image strings unchanged, checks the final bundle's JavaScript syntax,
and verifies every embedded image matches its pre-conversion value before writing
`builder.js`. A syntax or image-integrity failure stops the build.
