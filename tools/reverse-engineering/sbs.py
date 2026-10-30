import sys
from PIL import Image
a,b,out=Image.open(sys.argv[1]),Image.open(sys.argv[2]),sys.argv[3]
seg=int(sys.argv[4]) if len(sys.argv)>4 else 2500; s=float(sys.argv[5]) if len(sys.argv)>5 else 0.3
h=max(a.height,b.height);n=0
for y in range(0,h,seg):
    pa,pb=a.crop((0,y,a.width,min(y+seg,a.height))),b.crop((0,y,b.width,min(y+seg,b.height)))
    W=int(a.width*s);H=int(seg*s)
    c=Image.new('RGB',(W*2+10,H),'red');c.paste(pa.resize((W,int(pa.height*s))),(0,0));c.paste(pb.resize((W,int(pb.height*s))),(W+10,0))
    c.save(f'{out}-{n}.png');n+=1
print(n,'strips')
