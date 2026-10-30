"""Extract the rigged Teddy SVG + per-pose part transforms from reference pages."""
import re, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from jsx import convert

ref, out = sys.argv[1], sys.argv[2]
instances = {}
for f in sorted(os.listdir(ref)):
    if not f.endswith('.html'):
        continue
    h = re.sub(r'<script.*?</script>', '', open(os.path.join(ref, f)).read(), flags=re.S)
    for m in re.finditer(r'<svg[^>]*>(?:(?!</svg>).)*data-p="root".*?</svg>', h, flags=re.S):
        before = h[max(0, m.start() - 600):m.start()]
        pose = re.findall(r'data-pose="([a-z]+)"', before)
        lab = re.search(r'aria-label="Teddy, ([^"]+)"', m.group(0))
        key = pose[-1] if pose else (lab.group(1) if lab else 'default')
        instances.setdefault(key, m.group(0))

PART = re.compile(r'<(\w+)([^>]*?data-p="([A-Za-z]+)"[^>]*)>')


def parts(svg):
    d = {}
    for m in PART.finditer(svg):
        a = m.group(2)
        t = re.search(r'\stransform="([^"]*)"', a)
        o = re.search(r'\sopacity="([^"]*)"', a)
        d[m.group(3)] = {'t': t.group(1) if t else None, 'o': o.group(1) if o else None}
    return d


table = {k: parts(v) for k, v in instances.items()}
names = list(next(iter(table.values())).keys())
varying = [n for n in names if len({json.dumps(table[k].get(n)) for k in table}) > 1]
base_key = 'sit' if 'sit' in table else next(iter(table))
base = instances[base_key]

# Strip the outer <svg> so the component owns it; parametrise varying parts.
inner = re.sub(r'^<svg[^>]*>|</svg>$', '', base.strip())


def param(m):
    tag, a, name = m.group(1), m.group(2), m.group(3)
    if name not in varying:
        return m.group(0)
    a = re.sub(r'\s(transform|opacity)="[^"]*"', '', a)
    return f'<{tag}{a} data-param="{name}">'


inner = PART.sub(param, inner)
jsx = convert(inner)
jsx = re.sub(r'data-param="(\w+)"', lambda m: f'transform={{p.{m.group(1)}?.t}} opacity={{p.{m.group(1)}?.o}}', jsx)

poses = {}
for k, d in table.items():
    slug = re.sub(r'[^a-z]+', '-', k.lower()).strip('-')
    poses[slug] = {n: {kk: vv for kk, vv in d[n].items() if vv is not None} for n in varying}

with open(os.path.join(out, 'teddy-poses.ts'), 'w') as fh:
    fh.write('// Part transforms for each Teddy pose, captured from the rigged drawing.\n')
    fh.write('export type PartState = { t?: string; o?: string };\n')
    fh.write(f'export type TeddyPart = {" | ".join(json.dumps(v) for v in varying)};\n')
    fh.write('export const TEDDY_POSES = ' + json.dumps(poses, indent=2) +
             ' satisfies Record<string, Record<TeddyPart, PartState>>;\n')
    fh.write('export type TeddyPose = keyof typeof TEDDY_POSES;\n')

with open(os.path.join(out, 'TeddyArt.tsx'), 'w') as fh:
    fh.write('import type { PartState, TeddyPart } from "./teddy-poses";\n\n')
    fh.write('/** The rigged Teddy drawing. Parts named in `p` get their pose transform. */\n')
    fh.write('export function TeddyArt({ p }: { p: Record<TeddyPart, PartState> }) {\n  return (\n    <g data-p="root-art">\n')
    fh.write('      ' + jsx + '\n    </g>\n  );\n}\n')

print('poses:', list(poses), '\nvarying:', varying)
