"""Build rehomed-puppy records from their reference detail pages."""
import re, json, os, sys, html

ref, out = sys.argv[1], sys.argv[2]
KEYS = ('id', 'url', 'kind', 'width', 'height', 'alt', 'caption', 'focalX', 'focalY', 'color', 'blurDataUrl', 'durationS', 'poster')
GENDER = {'Boy': 'male', 'Girl': 'female', 'Boy & Girl': 'male-female', 'Boys & Girls': 'male-female'}
BREEDS = {'maltipoo': 'maltipoo', 'pomeranian': 'pomeranian', 'poodle': 'poodle', 'cavapoo': 'cavapoo',
          'shih tzu': 'shih-tzu', 'maltese': 'maltese', 'bichon': 'bichon', 'pomsky': 'pomsky'}


def media(m):
    if not m:
        return None
    d = {k: m.get(k) for k in KEYS}
    d['poster'] = media(m.get('poster'))
    return d


def payload(h):
    ch = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', h, flags=re.S)
    return ''.join(json.loads('"' + c + '"') for c in ch)


def dd(h, label):
    m = re.search(re.escape(label) + r'</dt><dd[^>]*>(.*?)</dd>', h, flags=re.S)
    return html.unescape(re.sub(r'<!--.*?-->', '', m.group(1))).strip() if m else ''


slugs = [s.strip() for s in open(os.path.join(ref, 'gone', 'slugs.txt')) if s.strip()]
pups = []
for slug in slugs:
    h = open(os.path.join(ref, 'gone', slug + '.html')).read()
    p = payload(h)
    j = p.find('"media":[')
    gallery, _ = json.JSONDecoder().raw_decode(p, j + 8)
    h1 = html.unescape(re.search(r'<h1 class="font-plush mt-4[^"]*">(.*?)</h1>', h, flags=re.S).group(1)).strip()
    sub = re.search(r'</h1><p class="mt-2 text-lg font-semibold text-cocoa-soft">(.*?)</p>', h)
    desc = re.search(r'whitespace-pre-line text-cocoa-soft">(.*?)</p>', h, flags=re.S)
    breed = dd(h, 'Breed')
    label = dd(h, 'Boy or girl')
    pups.append({
        'slug': slug, 'name': h1 if sub else '', 'displayName': h1, 'breed': breed,
        'gender': GENDER.get(label, 'male'), 'genderLabel': label, 'age': dd(h, 'Age'), 'colour': dd(h, 'Colour'),
        'description': html.unescape(desc.group(1)).strip() if desc else '', 'status': 'rehomed', 'featured': False,
        'origin': 'imported' if dd(h, 'Where').startswith('Imported') else 'local',
        'breeds': sorted({v for k, v in BREEDS.items() if k in breed.lower()}), 'collections': [],
        'cover': media(gallery[0]), 'media': [media(m) for m in gallery],
    })
    print(slug, '|', h1, '|', breed, '|', label, '|', len(gallery))

json.dump(pups, open(out, 'w'), indent=2, ensure_ascii=False)
