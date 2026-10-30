"""Condense captured live DOM for reading: collapse art, long attrs, repeated list items."""
import re, sys

s = open(sys.argv[1]).read()
keep_styles = len(sys.argv) > 2 and sys.argv[2] == 'styles'
s = re.sub(r'<svg[^>]*data-p="root".*?</svg>', '<TEDDY/>', s, flags=re.S)
s = re.sub(r'(<svg[^>]*>).*?</svg>', r'\1…</svg>', s, flags=re.S)
s = re.sub(r'\s(srcset|sizes|decoding|loading|data-nimg|data-armed|data-revealed|for|aria-describedby)="[^"]*"', '', s)
if not keep_styles:
    s = re.sub(r'\sstyle="[^"]*"', '', s)
else:
    s = re.sub(r'style="([^"]{0,160})[^"]*"', r'style="\1"', s)
s = re.sub(r'src="/_next/image\?url=([^&"]+)[^"]*"', lambda m: 'src="…' + m.group(1)[-14:] + '"', s)
s = re.sub(r'<form.*?</form>', '<FORM/>', s, flags=re.S)
s = re.sub(r'class="([^"]{100})[^"]*"', r'class="\1…"', s)
s = re.sub(r'>\s*<', '>\n<', s)
# collapse runs of sibling <li> after the first two
out, run = [], 0
for block in re.split(r'(?=\n<li[ >])', s):
    if block.startswith('\n<li'):
        run += 1
        if '<ul' in block.split('</li>')[-1] or '<ol' in block.split('</li>')[-1]:
            out.append(block)
            run = 0
            continue
        if run > 2:
            if run == 3:
                out.append('\n<!-- …more li… -->')
            # keep closing structure after the li (if any)
            tail = block.rsplit('</li>', 1)
            if len(tail) == 2 and '<li' not in tail[1]:
                out.append(tail[1])
                if '<ul' in tail[1] or '<ol' in tail[1]:
                    run = 0
            continue
    else:
        run = 0
    out.append(block)
print(''.join(out))
