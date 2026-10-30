import re,sys,os,collections
src,start,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
lines=open(src).read().split('\n')[start-1:]
blocks=[];buf=[];depth=0
for ln in lines:
    buf.append(ln);depth+=ln.count('{')-ln.count('}')
    if depth==0 and '{' in ''.join(buf): blocks.append('\n'.join(buf));buf=[]
G={'mascot':'pup-',
 'home':'actor layer prints probe book chat chips clip door doors dusk facade fork hero home horizon house lamp lineup meet msg night passport paths phone photowall qa quilt route sign snaps street typing way window',
 'stamps':'entry flight stamp',
 'contact':'blank letterform visit','gone-home':'booth boothhead ticket tickets',
 'puppy':'chapter ribbon tag trail storybook storypage','faq':'faqroom note notes',
 'puppies':'gone sketch sketchbook sketches sketchpad sticker','how-it-works':'journey journeys postcard step steps switch',
 'happy-families':'memories wall'}
lookup={}
for f,ws in G.items():
    for w in ws.split(): lookup['tp-'+w]=f
def grp(b):
    head=b.split('{',1)[0]
    if head.startswith('@keyframes') or head.startswith('@media') or head.startswith('@supports'):
        m=re.findall(r'\.((?:tp|pup)-[a-z]+)',b)
        return None if not m else ('mascot' if m[0].startswith('pup-') else lookup.get(m[0],'chrome'))
    m=re.search(r'\.((?:tp|pup)-[a-z]+)',head)
    if not m: return 'chrome'
    return 'mascot' if m.group(1).startswith('pup-') else lookup.get(m.group(1),'chrome')
files=collections.defaultdict(list);prev='chrome'
for b in blocks:
    g=grp(b)
    if g is None or b.startswith('@keyframes'): g=prev
    files[g].append(b);prev=g
os.makedirs(out,exist_ok=True)
order=['chrome','mascot','stamps','home','puppies','puppy','happy-families','how-it-works','faq','contact','gone-home']
for g in order:
    open(os.path.join(out,g+'.css'),'w').write(f'/* {g} */\n'+'\n\n'.join(files[g])+'\n')
    print(g,len(files[g]),sum(b.count('\n')+1 for b in files[g]))
