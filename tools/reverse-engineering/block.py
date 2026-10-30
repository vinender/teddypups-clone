"""Extract a balanced element from a reference page and print it as JSX.

usage: block.py page.html '<start regex>' [nth]
Teddy drawings are replaced with {/* TEDDY */} markers; long path data is kept.
"""
import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from jsx import convert

page, pat = sys.argv[1], sys.argv[2]
nth = int(sys.argv[3]) if len(sys.argv) > 3 else 0
h = open(page).read()
h = re.sub(r'<script.*?</script>', '', h, flags=re.S)
h = re.sub(r'<template[^>]*></template>', '', h)
starts = [m for m in re.finditer(pat, h)]
m = starts[nth]
tag = re.match(r'<([a-zA-Z][\w-]*)', h[m.start():]).group(1)
depth, i = 0, m.start()
tok = re.compile(r'<(/?)' + tag + r'(?=[\s>/])[^>]*?(/?)>')
for t in tok.finditer(h, m.start()):
    if t.group(2):
        continue
    depth += -1 if t.group(1) else 1
    if depth == 0:
        i = t.end()
        break
frag = h[m.start():i]
frag = re.sub(r'<svg[^>]*>(?:(?!</svg>).)*data-p="root".*?</svg>', '<teddy-marker></teddy-marker>', frag, flags=re.S)
out = convert(frag).replace('<teddy-marker />', '{/* TEDDY */}')
out = re.sub(r'(src|href)="/_next/image\?url=([^&"]+)[^"]*"',
             lambda mm: f'{mm.group(1)}="{__import__("urllib.parse").parse.unquote(mm.group(2))}"', out)
out = re.sub(r'\s(srcSet|sizes|decoding|data-nimg)="[^"]*"', '', out)
print(out)
