"""Turn the reference RSC data into typed TS data modules."""
import json, os, sys

ref, out = sys.argv[1], sys.argv[2]
load = lambda f: json.load(open(os.path.join(ref, f)))
home, pups, fam, faq, how = (load(f) for f in (
    'index.data.json', 'puppies.data.json', 'happy-families.data.json', 'faq.data.json', 'how-it-works.data.json'))

MEDIA_KEYS = ('id', 'url', 'kind', 'width', 'height', 'alt', 'caption', 'focalX', 'focalY', 'color', 'blurDataUrl', 'durationS', 'poster')


def media(m):
    if m is None:
        return None
    d = {k: m.get(k) for k in MEDIA_KEYS}
    d['poster'] = media(m.get('poster'))
    return d


def puppy(p):
    return {
        'slug': p['slug'], 'name': p['name'], 'displayName': p['displayName'], 'breed': p['breed'],
        'gender': p['gender'], 'genderLabel': p['genderLabel'], 'age': p['age'], 'colour': p['colour'],
        'description': p['description'], 'status': p['status'], 'featured': p['featured'],
        'origin': p['origin']['slug'] if p.get('origin') else 'local',
        'breeds': [b['slug'] for b in p.get('breeds', [])],
        'collections': [c['slug'] for c in p.get('collections', [])],
        'cover': media(p['cover']), 'media': [media(m) for m in p['media']],
    }


def dump(name, header, body):
    with open(os.path.join(out, name), 'w') as fh:
        fh.write(header + body)
    print(name, os.path.getsize(os.path.join(out, name)))


J = lambda v: json.dumps(v, indent=2, ensure_ascii=False)
dump('puppies.json', '', J({
    'puppies': [puppy(p) for p in pups['puppies']],
    'breeds': home['breeds'],
    'filterBreeds': pups['breeds'],
    'collections': pups['collections'],
}))
dump('family-photos.json', '', J([media(m) for m in fam['photos']]))
dump('faqs.json', '', J([{'id': f['id'], 'question': f['question'], 'answer': f['answer']} for f in faq['faqs']]))
dump('steps.json', '', J({'home': home['items'], 'howItWorks': how['steps']}))
