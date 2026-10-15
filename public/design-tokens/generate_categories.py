"""Generate offline category helpers and CSS from categories.json. Pass --check to verify."""
import json
import sys
from pathlib import Path
root = Path(__file__).resolve().parent
data = json.loads((root / 'categories.json').read_text())
css = ['/* Generated from categories.json by generate_categories.py. */', '.ivy-category-pill { color: var(--category-text); border-color: var(--category-border); background-color: var(--category-background); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }']
for category in data['categories']:
    css.append('[data-ivy-category="' + category['id'] + '"] { ' + ' '.join('--category-' + role + ': var(' + value['token'] + ');' for role, value in category['colors'].items()) + ' }')
js = '''/* Generated from categories.json by generate_categories.py. Works with file:// previews. */
(() => {
  const categories = CATEGORIES;
  function createPill(name) {
    const category = categories.find(category => category.name === name);
    if (!category) throw new Error(`Unknown Ivy category: ${name}`);
    const pill = document.createElement('span');
    pill.className = 'ivy-category-pill inline-flex items-center rounded-full border px-2 font-body text-xs font-normal leading-text-xs h-[22px]';
    pill.dataset.ivyCategory = category.id;
    pill.setAttribute('aria-label', `Category: ${name}`);
    pill.textContent = name;
    return pill;
  }
  window.IvyCategories = { categories, createPill };
})();
'''.replace('CATEGORIES', json.dumps(data['categories'], indent=2))
for name, content in [('categories.css', '\n'.join(css)+'\n'), ('categories.js', js)]:
    path = root/name
    if '--check' in sys.argv:
        assert path.read_text() == content, f'{name} is out of date'
    else:
        path.write_text(content)
print('Category reference files verified.' if '--check' in sys.argv else 'Category reference files generated.')
