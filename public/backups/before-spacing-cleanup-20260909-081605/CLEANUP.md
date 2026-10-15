# Spacing and utility-class cleanup

The untouched, checksum-verified `snapshot.zip` in this folder contains the complete workspace before this cleanup. See `README.md` to restore it.

## Conventions

- Rem lengths resolve to whole pixels at a 16px root. Fractional pixel lengths are rounded to whole pixels as well.
- Custom margin, padding, and gaps use 0, 1, 2, 4, 6, 8, 12, and 16px, followed by 4px increments. Values snap to the nearest step, with ties rounded upward. Negative margins keep their sign; automatic and percentage-based spacing remain relative.
- Layout and spacing use existing Tailwind utilities where they match. The shared stylesheet retains standard utility definitions; markup uses the approved spacing tokens.
- CSS remains for scoped selectors, interaction states, responsive overrides, colors, and details without equivalent existing utilities.

## Verification

All four HTML mocks retain their element structure and IDs, and all inline JavaScript passes syntax checks. All HTML/CSS rem literals resolve to whole pixels at a 16px root, and custom fixed spacing follows the scale. Browser checks covered the collections index grid/list/filter/preview, chat tabs, recommendations including creation and additions, History filtering/pagination/details, and responsive index/chat layouts. The backup archive was reverified after the work.

See `cleanup-summary.json` for exact counts.
