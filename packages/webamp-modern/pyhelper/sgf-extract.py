from collections import defaultdict
import os, struct
print('halo')

os.chdir(os.path.dirname(__file__))

print(os.path.abspath(os.path.curdir))



def save(path, buf):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(buf)

class SgfFileExtractor:
    def __init__(self, skinPath) -> None:
        self._toc = {}
        self.f = open(skinPath, 'rb')
        self.buildTOC()
        
    def buildTOC(self):
        self.f.seek(0x0c)
        dataAddress = self.readInt32LE()
        print('dataAddress:',dataAddress)
        self.f.seek(16 * 6, True); # I don't know why empty space
        while self.f.tell() < dataAddress:
            # s, = unpack('%ss' % (16*5), self.read(16*5))
            fileName = self.readString(16 * 5)
            print('filename:', fileName)
            # s = s.decode('utf-8').strip('\x00')

            self.f.seek(4, True);
            chunkStart = self.readInt32LE()
            chunkSize = self.readInt32LE()

            self._toc[fileName] = {
                'start': chunkStart,
                'size': chunkSize,
                'end': chunkStart + chunkSize,
            };
            self.f.seek(8, True) # I don't know why empty space
        
        print(self._toc)

    def readInt32LE(self): 
        buf = self.f.read(4)
        return struct.unpack_from("<L", buf)[0]

    def readInt16(self): 
        buf = self.f.read(2)
        return struct.unpack_from("<h", buf)[0]

    def readString(self, length): 
        buf = self.f.read(length)
        # print(length, 'readStr:', repr(buf))
        return buf.decode().strip('\0')
  
    
target_dir = '../assets/extracted-sgf'

filepath = '../assets/sonique.sgf'
filepath = 'sys-sonique.sgf'
filepath = 'lycossearch.sgf'
filepath = 'hotbotsearch.sgf'
filepath = '../assets/ChainZ-and.sgf'
# filepath = '../assets/scifi-stories.sgf'
filepath = '../assets/phantom.sgf'

_, fname = os.path.split(filepath)
print('fname=',fname)
sgf = SgfFileExtractor(filepath)

rgns = defaultdict(list)
for k,cfg in sgf._toc.items():
    k = k.strip('/')
    parts = k.split('/')
    print(parts)
    ext = parts[0]
    if ext == 'rgn': 
        rgns[parts[1]].append(parts[-1])
        ext = 'bmp'
    filename = os.path.join(target_dir, fname,  k + '.' + ext)
    print('saving ',filename)
    sgf.f.seek(cfg['start'])
    buf = sgf.f.read(cfg['size'])
    save(filename, buf)

import pprint
pprint.pprint(rgns)

# for siz, bitmaps in rgns.items():    
#     #?pop frame
#     # n = bitmaps.index('frame')
#     bitmaps.remove('frame')
#     print('frame of ', siz)
#     cfg = sgf._toc['/rgn/' + siz + '/frame']
#     sgf.f.seek(cfg['start'])
#     while sgf.f.tell() < cfg['end']:
#         for i in range(4):
#             print(sgf.readInt16(), end=', ')
#         print()
#     print('\n')
#     # frame_rgn = 
    