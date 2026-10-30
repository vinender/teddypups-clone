"""Emit named React SVG components from reference SVGs.

usage: art.py ref_dir out.tsx spec.txt
spec lines:  ComponentName | page.html | regex matching the <svg ...> opening tag [| nth]
The svg's className is replaced by a `className` prop (defaulting to the original);
aria-hidden is kept. useId-style ids (_R_xxx_) become per-instance ids via useId().
"""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from jsx import convert

ref, out, spec = sys.argv[1:4]
pages = {}


def page(f):
    if f not in pages:
        pages[f] = re.sub(r'<script.*?</script>', '', open(os.path.join(ref, f)).read(), flags=re.S)
    return pages[f]


comps, needs_id = [], False
for line in open(spec):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    parts = [p.strip() for p in line.split('|')]
    name, f, pat = parts[:3]
    nth = int(parts[3]) if len(parts) > 3 else 0
    h = page(f)
    starts = [m.start() for m in re.finditer(pat, h)]
    if len(starts) <= nth:
        print('MISSING', name, file=sys.stderr)
        continue
    s = starts[nth]
    depth = 0
    for t in re.finditer(r'<(/?)svg(?=[\s>])[^>]*>', h[s:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            svg = h[s:s + t.end()]
            break
    cls = re.search(r'<svg[^>]*\sclass="([^"]*)"', svg)
    default = cls.group(1) if cls else ''
    svg = re.sub(r'(<svg[^>]*?)\sclass="[^"]*"', r'\1', svg, count=1)
    ids = sorted(set(re.findall(r'_R_[A-Za-z0-9_]+?_(?=["#)])', svg)))
    j = convert(svg)
    j = j.replace('<svg', '<svg className={className} {...props}', 1)
    body = j
    if ids:
        needs_id = True
        for i, x in enumerate(ids):
            body = body.replace(f'url(#{x})', f'{{`url(#${{uid}}{i})`}}').replace(f'"#{x}"', f'{{`#${{uid}}{i}`}}').replace(f'"{x}"', f'{{`${{uid}}{i}`}}')
        body = re.sub(r'="\{`url\(#\$\{uid\}(\d+)\)`\}"', r'={`url(#${uid}\1)`}', body)
        pre = '  const uid = useId();\n'
    else:
        pre = ''
    comps.append(f'export function {name}({{ className = {json.dumps(default) if default else "undefined"}, ...props }}: SVGProps<SVGSVGElement>) {{\n{pre}  return (\n    {body}\n  );\n}}\n')

with open(out, 'w') as fh:
    fh.write('// Decorative SVG artwork. Generated from the reference drawings, then hand-tuned.\n')
    fh.write('import { ' + ('useId, ' if needs_id else '') + 'type SVGProps } from "react";\n')
    fh.write('\n' + '\n'.join(comps))
print(len(comps), 'components ->', out)
