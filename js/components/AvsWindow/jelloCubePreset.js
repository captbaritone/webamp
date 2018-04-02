const preset = {
  name: "Jello Cube",
  author: "Steven Wittens / UnConeD (http://acko.net)",
  clearFrame: false,
  components: [
    {
      type: "EffectList",
      enabled: true,

      components: [
        {
          type: "DynamicMovement",
          noGrid: true,
          compat: true,
          code: {
            perPixel: "d=sin(d*(1+d*sin(r*150)*.15))*.5+d*.5;r=r+.01;"
          }
        },
        {
          type: "EffectList",
          enableOnBeat: true,
          enableOnBeatFor: 1,
          output: "MAXIMUM",
          components: [
            {
              type: "BufferSave",
              action: "RESTORE"
            },
            {
              type: "ColorClip",
              enabled: false,
              mode: "ABOVE",
              color: "#9F9F9F",
              outColor: "#9F9F9F"
            }
          ]
        }
      ]
    },
    {
      type: "ColorMap",
      output: "REPLACE",
      key: "RED",
      maps: [
        {
          enabled: true,
          colors: [
            { color: "#FFFFFF", position: 52 },
            { color: "#0FA7F0", position: 130 },
            { color: "#000000", position: 255 }
          ]
        }
      ]
    },
    {
      type: "EffectList",
      clearFrame: true,
      input: "IGNORE",
      output: "SUBTRACTIVE1",
      components: [
        {
          type: "SuperScope",
          clone: 12,
          blendMode: "ADDITIVE",
          code: {
            init: "dx=8;n=sqr(dx);id=2/dx;id1=1/(dx-1);",
            onBeat: [
              "rxt=(abs((getosc(.55,0,0)+getosc(.91,0,0))*2000)%628)*.01;",
              "ryt=(abs((getosc(.12,0,0)+getosc(.41,0,0))*2000)%628)*.01;",
              "rzt=(abs((getosc(.55,0,0)+getosc(.91,0,0))*2000)%628)*.01;"
            ].join("\n"),
            perFrame: [
              "t=t-.05;",
              "dt=sin(t)*sin(t*.411+1)*cos(sin(t*.117))*.5+3;",
              "gx=-1;",
              "gy=0;",
              "rx=rx*.95+rxt*.05;",
              "ry=ry*.95+ryt*.05;",
              "rz=rz*.95+rzt*.05;",
              "cx=cos(rx);",
              "sx=sin(rx);",
              "cy=cos(ry);",
              "sy=sin(ry);",
              "cz=cos(rz);",
              "sz=sin(rz);",
              "af=w/h;",
              "p00=getosc(select(cid,0.41,0.41,0.49,0.49,0.36,0.36,0.41,0.41,0.41,0.41,0.67,0.67),0,0)*.35+p00*.65;",
              "p10=getosc(select(cid,0.00,0.00,0.15,0.15,0.24,0.24,0.60,0.60,0.00,0.00,0.76,0.76),0,0)*.35+p10*.65;",
              "p20=getosc(select(cid,0.92,0.92,0.84,0.84,0.20,0.20,0.74,0.74,0.92,0.92,0.37,0.37),0,0)*.35+p20*.65;",
              "p30=getosc(select(cid,0.36,0.36,0.38,0.38,0.17,0.17,0.67,0.67,0.36,0.36,0.17,0.17),0,0)*.35+p30*.65;",
              "p01=getosc(select(cid,0.60,0.60,0.26,0.26,0.19,0.19,0.06,0.06,0.06,0.06,0.97,0.97),0,0)*.35+p01*.65;",
              "p11=getosc(select(cid,0.59,0.59,0.48,0.48,0.54,0.54,0.42,0.42,0.85,0.85,0.23,0.23),0,0)*.55+p11*.65;",
              "p21=getosc(select(cid,0.77,0.77,0.11,0.11,0.41,0.41,0.56,0.56,0.39,0.39,0.30,0.30),0,0)*.55+p21*.65;",
              "p31=getosc(select(cid,0.84,0.84,0.25,0.25,0.01,0.01,0.97,0.97,0.19,0.19,0.01,0.01),0,0)*.35+p31*.65;",
              "p02=getosc(select(cid,0.74,0.74,0.19,0.19,0.33,0.33,0.49,0.49,0.49,0.49,0.70,0.70),0,0)*.35+p02*.65;",
              "p12=getosc(select(cid,0.52,0.52,1.00,1.00,0.07,0.07,0.75,0.75,0.61,0.61,0.61,0.61),0,0)*.55+p12*.65;",
              "p22=getosc(select(cid,0.13,0.13,0.75,0.75,0.27,0.27,0.83,0.83,0.73,0.73,0.43,0.43),0,0)*.55+p22*.65;",
              "p32=getosc(select(cid,0.20,0.20,0.74,0.74,0.93,0.93,0.70,0.70,0.33,0.33,0.93,0.93),0,0)*.35+p32*.65;",
              "p03=getosc(select(cid,0.67,0.67,0.20,0.20,0.38,0.38,0.49,0.49,0.49,0.49,0.20,0.20),0,0)*.35+p03*.65;",
              "p13=getosc(select(cid,0.76,0.76,0.94,0.94,0.25,0.25,0.26,0.26,0.15,0.15,0.94,0.94),0,0)*.35+p13*.65;",
              "p23=getosc(select(cid,0.37,0.37,0.35,0.35,0.74,0.74,0.19,0.19,0.84,0.84,0.35,0.35),0,0)*.35+p23*.65;",
              "p33=getosc(select(cid,0.17,0.17,0.93,0.93,0.93,0.93,0.20,0.20,0.38,0.38,0.93,0.93),0,0)*.35+p33*.65;",
              "cr=sin(hu)*.5+.9;",
              "cg=sin(hu+2.09)*.5+.9;",
              "cb=sin(hu+4.18)*.5+.9;",
              "xo=sin(t*.741)*sin(t*.114)*cos(sin(t*.41));",
              "yo=sin(t*.574)*sin(t*.319)*cos(sin(t*.33));"
            ].join("\n"),
            perPoint: [
              "gy=if(equal(gx,dx-1),gy+1,gy);",
              "gx=if(below(gx,dx-1),gx+1,0);",

              "x1=select(cid%2, gx, gy)*id1;",
              "y2=select(cid%2, gy, gx)*id1;",

              "red=1-x1;",
              "green=1-y2;",
              "c1=sqr(red)*red*p00 + 3*sqr(red)*x1*p10 + 3*red*sqr(x1)*p20 + sqr(x1)*x1*p30;",
              "c2=sqr(red)*red*p01 + 3*sqr(red)*x1*p11 + 3*red*sqr(x1)*p21 + sqr(x1)*x1*p31;",
              "c3=sqr(red)*red*p02 + 3*sqr(red)*x1*p12 + 3*red*sqr(x1)*p22 + sqr(x1)*x1*p32;",
              "c4=sqr(red)*red*p03 + 3*sqr(red)*x1*p13 + 3*red*sqr(x1)*p23 + sqr(x1)*x1*p33;",
              "c1=3*(sqr(green)*green*c1 + 3*sqr(green)*y2*c2 + 3*green*sqr(y2)*c3 + sqr(y2)*y2*c4) + 1;",

              "px=select(cid, x1*2-1, x1*2-1, x1*2-1, x1*2-1, 1,      1,     -1,     -1,      x1*2-1, x1*2-1, x1*2-1, x1*2-1);",
              "py=select(cid, y2*2-1, y2*2-1, y2*2-1, y2*2-1, x1*2-1, x1*2-1, x1*2-1, x1*2-1, -1,     -1,     1,      1);",
              "pz=select(cid, -1,     -1,     1,      1,      y2*2-1, y2*2-1, y2*2-1, y2*2-1, y2*2-1, y2*2-1, y2*2-1, y2*2-1);",

              "px=px*c1;",
              "py=py*c1;",
              "pz=pz*c1;",

              "x1=px*cz+py*sz;",
              "py=px*sz-py*cz;",
              "y2=py*cx+pz*sx+yo;",
              "z2=py*sx-pz*cx;",
              "x3=x1*cy+z2*sy+xo;",
              "z2=x1*sy-z2*cy+dt;",
              "x1=if(above(z2,.1),1/z2,0);",
              "x=x3*x1;",
              "y=y2*x1*af;",
              "x1=bnot(equal(gx,0))*x1*2;",
              "red=x1*.5;",
              "green=x1*2;",
              "blue=x1*2;"
            ].join("\n")
          }
        },
        {
          type: "Convolution",
          scale: 8,
          kernel: [
            0,
            0,
            1,
            0,
            0,
            0,
            2,
            4,
            2,
            0,
            1,
            4,
            2,
            4,
            1,
            0,
            2,
            4,
            2,
            0,
            0,
            0,
            1,
            0,
            0
          ]
        },
        {
          type: "BufferSave",
          action: "SAVE"
        }
      ]
    }
  ]
};

export default preset;
