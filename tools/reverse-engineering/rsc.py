import re,json,sys,os,collections
ref=sys.argv[1]
def payload(f):
    h=open(os.path.join(ref,f)).read()
    ch=re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)',h,flags=re.S)
    return ''.join(json.loads('"'+c+'"') for c in ch)
def arrays(p):
    dec=json.JSONDecoder();out={}
    for m in re.finditer(r'"([A-Za-z]+)":\[\{',p):
        try: v,_=dec.raw_decode(p,m.end()-2)
        except Exception: continue
        k=m.group(1)
        if isinstance(v,list) and v and isinstance(v[0],dict) and any(x in v[0] for x in('slug','url','question','q','caption','title','id')):
            if k not in out or len(json.dumps(v))>len(json.dumps(out[k])): out[k]=v
    return out
for f in sorted(os.listdir(ref)):
    if not f.endswith('.html'): continue
    p=payload(f); a=arrays(p)
    print(f, {k:(len(v),list(v[0].keys())[:8]) for k,v in a.items() if k not in('children',)})
    json.dump(a,open(os.path.join(ref,f[:-5]+'.data.json'),'w'),indent=1)
