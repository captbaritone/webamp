import os
os.chdir(os.path.dirname(__file__))

print(os.path.abspath(os.path.curdir))

target = '../assets/extracted-MMD3'
target = '../assets/extracted-'
target = '../assets/extracted-/Winamp Modern'


for root, subdirs, files in os.walk(target):
    print('root:', root)
    # fn = os.path.join(root, su)
    for folder in subdirs:
        print('   folder:', folder)

    for file in files:
        print('         file:', file)
        if file.lower() != file:
            print('        renamed', file.lower())
            os.rename(
                os.path.join(root, file),
                os.path.join(root, file.lower())
            )
