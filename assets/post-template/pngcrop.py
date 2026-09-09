import zlib,struct,sys
def decode(p):
    d=open(p,'rb').read(); i=8; idat=b''
    while i<len(d):
        ln=struct.unpack('>I',d[i:i+4])[0]; typ=d[i+4:i+8]; data=d[i+8:i+8+ln]
        if typ==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',data[:10])
        if typ==b'IDAT': idat+=data
        i+=12+ln
    raw=zlib.decompress(idat); bpp=4 if ct==6 else 3; stride=w*bpp
    out=[]; prev=bytearray(stride); pos=0
    for y in range(h):
        f=raw[pos]; pos+=1; line=bytearray(raw[pos:pos+stride]); pos+=stride
        for x in range(stride):
            a=line[x-bpp] if x>=bpp else 0; b=prev[x]; c=prev[x-bpp] if x>=bpp else 0
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+b)&255
            elif f==3: line[x]=(line[x]+(a+b)//2)&255
            elif f==4:
                pa=abs(b-c); pb=abs(a-c); pc=abs(a+b-2*c)
                pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                line[x]=(line[x]+pr)&255
        out.append(bytes(line)); prev=line
    return w,h,bpp,ct,out
def encode(p,w,h,bpp,ct,rows):
    raw=b''.join(b'\x00'+r for r in rows[:h])
    def chunk(t,d):
        return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,ct,0,0,0))
    png+=chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
    open(p,'wb').write(png)
src,dst,H=sys.argv[1],sys.argv[2],int(sys.argv[3])
w,h,bpp,ct,rows=decode(src)
encode(dst,w,H,bpp,ct,rows)
print('cropped',w,'x',H)
