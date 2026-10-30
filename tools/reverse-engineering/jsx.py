"""HTML/SVG fragment -> JSX string."""
import re, html

VOID = {'img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'wbr'}
REN = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'playsinline': 'playsInline',
    'autoplay': 'autoPlay', 'readonly': 'readOnly', 'maxlength': 'maxLength', 'minlength': 'minLength',
    'autocomplete': 'autoComplete', 'inputmode': 'inputMode', 'enterkeyhint': 'enterKeyHint',
    'xlink:href': 'href', 'xml:space': 'xmlSpace', 'crossorigin': 'crossOrigin', 'srcset': 'srcSet',
    'fetchpriority': 'fetchPriority', 'spellcheck': 'spellCheck', 'datetime': 'dateTime',
    'colspan': 'colSpan', 'rowspan': 'rowSpan',
}
BOOL = {'hidden', 'disabled', 'required', 'muted', 'loop', 'playsInline', 'autoPlay', 'readOnly',
        'open', 'checked', 'multiple', 'selected', 'controls', 'noValidate'}


def camel(s):
    return re.sub(r'[-:]([a-z])', lambda m: m.group(1).upper(), s)


def style_obj(v):
    out = []
    for decl in html.unescape(v).split(';'):
        if ':' not in decl:
            continue
        k, val = decl.split(':', 1)
        k, val = k.strip(), val.strip()
        key = f'"{k}"' if k.startswith('--') else camel(k)
        out.append(f'{key}: {val}' if re.fullmatch(r'-?\d+(\.\d+)?', val) and not k.startswith('--')
                   else f'{key}: {jsstr(val)}')
    return '{{ ' + ', '.join(out) + ' }}'


def jsstr(v):
    return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'


def attrs(s):
    res = []
    for m in re.finditer(r'([^\s=/>]+)(?:="([^"]*)")?', s):
        k, v = m.group(1), m.group(2)
        if k.startswith('data-') or k.startswith('aria-'):
            nk = k
        elif k in REN or k.lower() in REN:
            nk = REN.get(k, REN.get(k.lower()))
        elif '-' in k or ':' in k:
            nk = camel(k)
        else:
            nk = k
        if v is None or (nk in BOOL and v == ''):
            res.append(nk)
            continue
        if nk == 'style':
            res.append('style=' + style_obj(v))
            continue
        v = html.unescape(v)
        if '"' in v or '\\' in v or '{' in v:
            res.append(f'{nk}={{{jsstr(v)}}}')
        else:
            res.append(f'{nk}="{v}"')
    return (' ' + ' '.join(res)) if res else ''


def convert(src):
    src = re.sub(r'<!--.*?-->', '', src, flags=re.S)

    def tag(m):
        close, name, a, selfc = m.group(1), m.group(2), m.group(3) or '', m.group(4)
        if close:
            return f'</{name}>'
        if name.lower() in VOID or selfc:
            return f'<{name}{attrs(a)} />'
        return f'<{name}{attrs(a)}>'

    out, pos = [], 0
    for m in re.finditer(r'<(/?)([a-zA-Z][\w:-]*)((?:\s[^>]*?)?)(/?)>', src):
        text = src[pos:m.start()]
        if text:
            out.append(text.replace('{', '&#123;').replace('}', '&#125;'))
        out.append(tag(m))
        pos = m.end()
    out.append(src[pos:])
    j = ''.join(out)
    return re.sub(r'<(\w[\w:-]*)([^>]*)></\1>', r'<\1\2 />', j)


if __name__ == '__main__':
    import sys
    print(convert(open(sys.argv[1]).read()))
