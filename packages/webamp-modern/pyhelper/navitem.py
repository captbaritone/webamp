import os, struct
from PIL import Image
print('navitem')

os.chdir(os.path.dirname(__file__))

print(os.path.abspath(os.path.curdir))


imagePath = '../src/skin/soniqueClasses/res/navitem.png'
newImagePath = '../src/skin/soniqueClasses/res/navitem-trans2.png'

im = Image.open(imagePath)

def redOrBlack (im):
    im = im.convert('RGBA')
    newimdata = []
    # redcolor = (255,0,0)
    # blackcolor = (0,0,0)
    hex = '0123456789abcdefg'
    arr = [] #? [  [color,count]  ]
    for i,color in enumerate(im.getdata()):
        r = color[0]
        h = round((r) / 16)
        h = r >> 4
        r = ((r+1) // 16) * 16 -1
        # r = ((r+1) // 8) * 8 -1
        # r = ((r+1) // 32) * 32 -1
        if r <=8: 
            r = 0

        if i == 0 :
            arr.append([r, 1])
        elif r == arr[-1][0]:   #? same as previous
            arr[-1][1] = arr[-1][1] +1
        else:
            arr.append([r, 1])
        # print(r, end=',')
        print(hex[h], end='')
        if i % 192 == 0:
            print('')
        # if color == redcolor:
        #     newimdata.append( redcolor )
        # else:
        #     newimdata.append( blackcolor )
        # color = tuple([color[0], color[1], color[2], color[0]])
        color = tuple([255,255,255, r])
        newimdata.append( color )

    # print(arr)
    newim = Image.new(im.mode,im.size)
    newim.putdata(newimdata)
    return newim

redOrBlack(im).save(newImagePath)
