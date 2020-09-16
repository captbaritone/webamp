import * as Skins from "./skins";
import { db } from "../db";

afterAll(() => {
  db.close();
});

test("getSkinToReview", async () => {
  const { md5, filename } = await Skins.getSkinToReview();
  expect(md5.length).toBe(32);
  expect(typeof filename).toBe("string");
});

test("getClassicSkinCount", async () => {
  const count = await Skins.getClassicSkinCount();
  expect(count > 60000).toBe(true);
});

test("getStats", async () => {
  const stats = await Skins.getStats();
  expect(stats).toMatchObject({
    approved: 1969,
    rejected: 4194,
    tweetable: expect.anything(),
    tweeted: expect.anything(),
  });
});

test("getRandomClassicSkinMd5", async () => {
  const skin = await Skins.getRandomClassicSkinMd5();
  expect(skin.length).toBe(32);
});

test("getMd5ByAnything substring", async () => {
  const md5 = await Skins.getMd5ByAnything(
    "https://skins.webamp.org/skin/35b3209e5a93ec22b989ca3f69fa795b/dotted_lines.wsz/"
  );
  expect(md5).toBe("35b3209e5a93ec22b989ca3f69fa795b");
});
test("getMd5ByAnything ia", async () => {
  const md5 = await Skins.getMd5ByAnything(
    "https://archive.org/details/winampskin_Expensive_HI_FI_Sony_2005"
  );
  expect(md5).toBe("6a2843f40058f86406630671b454d66b");
});

test("skinExists", async () => {
  expect(await Skins.skinExists("6a2843f40058f86406630671b454d66b")).toBe(true);
  expect(await Skins.skinExists("8a2843f40058f86406630671b454d66b")).toBe(
    false
  );
});
test("getSkinByMd5", async () => {
  const skin = await Skins.getSkinByMd5_DEPRECATED(
    "6a2843f40058f86406630671b454d66b"
  );
  expect(skin).toMatchInlineSnapshot(`
    Object {
      "approved": true,
      "averageColor": "rgba(123,123,122,0.977215)",
      "canonicalFilename": "Expensive_HI_FI_Sony_2005.wsz",
      "emails": Array [
        "wsmooney@hotmail.com",
        "rwaldin@pacbell.net",
        "interwebdesign@gmail.com",
        "wsmooney@hotmail.com",
        "rwaldin@pacbell.net",
        "interwebdesign@gmail.com",
      ],
      "fileNames": Array [
        "Expensive_HI_FI_Sony_2005.wsz",
        "Expensive_HI_FI_Sony_2005.wsz",
        "Expensive_HI_FI_Sony_2005.wsz",
      ],
      "filePaths": Array [
        "/Volumes/Mobile Backup/skins/skins/random/Winamp Skins/Skins/Cool Devices/Expensive_HI_FI_Sony_2005.wsz",
        "/Volumes/Mobile Backup/skins/skins/dump/Cool Devices/Expensive_HI_FI_Sony 2005/Expensive_HI_FI_Sony_2005.wsz",
        "/Volumes/Mobile Backup/skins/skins/download.nullsoft.com/customize/component/2005/9/3/S/Expensive_HI_FI_Sony_2005.wsz",
      ],
      "imageHash": "ffff00000000ff7f00643ffc7ffea000b815bb81ffff00008001a801ff07ffe7",
      "internetArchiveItemName": "winampskin_Expensive_HI_FI_Sony_2005",
      "internetArchiveUrl": "https://archive.org/details/winampskin_Expensive_HI_FI_Sony_2005",
      "md5": "6a2843f40058f86406630671b454d66b",
      "nsfwPredictions": Object {
        "drawing": 0.03091992,
        "hentai": 0.00045007,
        "neutral": 0.96861577,
        "porn": 0.0000128,
        "sexy": 0.00000143,
      },
      "readmeText": "(Spanish now, English below)
    ---------------------------------
    Hi-Fi Sony� 2005 por Mx 
    (InterWeb Design Argentina)
    Para Winamp Version 2 & 5
    Basado en la Piel  elaborada por Will Mooney 
    [ wsmooney@hotmail.com ]
    Gracias Will por tu permiso!!

    Mucho trabajo en los detalles, se redise�� el 
    total de los botones de la piel original, se 
    cambiaron los colores de los indicadores, 
    se agregaron cursores animados  y m�scaras
     de transparencias.
    Se agrega un plugin de visualizaci�n que hace
     juego con esta skin: WinAmp Speaker
    2.0 de Ray Waldin [ rwaldin@pacbell.net ] 
    (Copiar TKS--SPE.DLL en el directorio de 
    los plugins) 
    y fuente Square 721 BT (copiarla al directorio
     de fuentes de windows)

    Que mas decir? Es otra y talvez la mejor skin
     no oficial de Sony para vestir al mejor 
     reproductor: WINAMP.

    Fecha de terminaci�n: 
    20 de Agosto de 2005 - Rosario - Argentina
    Contacto: interwebdesign@gmail.com 

    necesitas una cuenta gmail??
    Solo tienes que enviarme un email y listo!!!

    -------------------------------------


    Hi-Fi Sony� 2005 By Mx
    InterWeb Design Argentina
    For Winamp Version 2 & 5
    Based on Will Mooney's 
    Expensive HI-Fi Sony skin 
    [ wsmooney@hotmail.com ]
    Thanks Will for your permission!!

    At lot of work on the details, it was redesigned
     all buttons, color of the indicators has been 
     changed, added animated cursors and a mask 
     of transparencies .  
    Added visualization plugins that's match with 
    this skin (I guess):   
    WinAmp Speaker 2.0 by Ray Waldin
     [ rwaldin@pacbell.net ]   
    (Copy TKS--SPE.DLL to plugins folder)   
    and font Square 721 BT 
    (copy to windows font folder)  
      
    What's else to say? This is another but maybe 
    the best unofficial skin for Sony to dress up 
    the best player: WINAMP

    Programs Used:
    -------------------------
    Photoshop CS2. & Microangelo 5.9
    release date: 
    August 20, 2005 - Rosario - Argentina
    Contact: interwebdesign@gmail.com

    Do you need an gmail account???
    Email me , you got itl!!!!

    CREDITS:
    -----------
    Winamp is Copyright � 1997-2005 Nullsoft, Inc. 
    and Justin Frankel. 
    Winamp is a trademark of Nullsoft, Inc.
    Expensive HI-Fi_Sony � 2002-2005 
    By Will Mooney
    WinAmp Speaker 2.0 beta 1 � 1998-2005 
    by Ray Waldin
    Adobe Photoshop is Copyright � 1991-2005 
    Adobe Corp.
    Microangelo 5.9 is Copyright � 1995-2005 
    Leonard A Gray, produced 
    by Impact Software, Inc
    ",
      "screenshotUrl": "https://cdn.webampskins.org/screenshots/6a2843f40058f86406630671b454d66b.png",
      "skinUrl": "https://cdn.webampskins.org/skins/6a2843f40058f86406630671b454d66b.wsz",
      "tweetId": "1077896846117285890",
      "tweetStatus": "TWEETED",
      "tweetUrl": "https://twitter.com/statuses/1077896846117285890",
      "tweeted": true,
      "twitterLikes": 23,
      "type": "CLASSIC",
      "webampUrl": "https://webamp.org?skinUrl=https://cdn.webampskins.org/skins/6a2843f40058f86406630671b454d66b.wsz",
    }
  `);
});
