"""Generate CSS from colors.json, or verify it with --check (Python standard library only)."""
import argparse
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
palette = json.loads((root / 'colors.json').read_text())
lines = [
    '/* Ivy color palette — generated from colors.json.',
    ' * Source: IVY Design (Copy).pdf, page 1.',
    ' * Regenerate: python3 design-tokens/generate_css.py',
    ' * Do not edit this generated file directly. */',
    ':root {'
]
for family, entry in palette['families'].items():
    if not re.fullmatch(r'[a-z][a-z0-9-]*', family):
        raise ValueError(f'Invalid family: {family}')
    lines.append(f"  /* {entry['label']} — {entry['section']} */")
    for shade, value in entry['shades'].items():
        if not shade.isdigit() or not re.fullmatch(r'#[0-9A-F]{6}', value):
            raise ValueError(f'Invalid swatch: {family}-{shade}: {value}')
        lines.append(f'  --ivy-color-{family}-{shade}: {value};')
    lines.append('')
for name, entry in palette.get('approvedOverrides', {}).items():
    value = entry['hex']
    if not re.fullmatch(r'[a-z][a-z0-9-]*', name) or not re.fullmatch(r'#[0-9A-F]{6}', value):
        raise ValueError(f'Invalid approved override: {name}: {value}')
    lines.append(f'  /* User-approved override: {name} */')
    lines.append(f'  --ivy-color-{name}: {value};')
lines += ['}', '']
css = '\n'.join(lines)
target = root / 'colors.css'
if args.check:
    if not target.exists() or target.read_text() != css:
        raise SystemExit('colors.css is out of sync; run the generator without --check.')
    print('Verified: CSS matches all PDF swatches and approved overrides in JSON.')
else:
    target.write_text(css)
    print(f'Generated {target.name}')
