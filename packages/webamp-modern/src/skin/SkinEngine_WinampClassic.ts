import parseXml, { XmlElement } from "@rgrove/parse-xml";
import JSZip from "jszip";
import { UIRoot } from "../UIRoot";
import { assume } from "../utils";
import Bitmap from "./Bitmap";
import BitmapFont from "./BitmapFont";
import { WmzImageManager } from "./classicClasses/wmzImageManager";
import regionParser from "./classicClasses/regionParser";
import { PathFileExtractor } from "./FileExtractor";
import EqVis from "./makiClasses/EqVis";
import Vis from "./makiClasses/Vis";
import { registerSkinEngine } from "./SkinEngine";
import SkinEngine, { GROUP_PHASE, RESOURCE_PHASE } from "./SkinEngine_WAL";

type StreamSource = {
  zip: JSZip;
  skinDir: string;
};
export default class ClassicSkinEngine extends SkinEngine {
  _wszRoot: string = "/assets/winamp_classic/";
  _streamSources: StreamSource[] = []; // for pop & push
  _TXTs: { [key: string]: string } = {};

  static canProcess = (filePath: string): boolean => {
    return (
      filePath.endsWith(".wsz") ||
      filePath.endsWith(".zip") ||
      filePath.endsWith("/")
    );
  };

  static identifyByFile = (filePath: string): string => {
    return "main.bmp";
  };

  // _pushCurrent

  // constructor(uiRoot: UIRoot) {
  //   super(uiRoot);
  // }

  /**
   * Process
   */
  async parseSkin() {
    this._phase = RESOURCE_PHASE;
    await this.loadKnowTXTs();
    await this.buildRegionTXT();

    await this.loadKnowBitmaps();
    await this._loadBitmaps();

    // load internal wsz prototype from:
    // this._uiRoot.setSkinDir("assets/winamp_classic/");
    // this._uiRoot.setPreferZip(false);
    const fileExtractor = new PathFileExtractor();
    await fileExtractor.prepare("assets/winamp_classic/", null);
    this._uiRoot.setFileExtractor(fileExtractor);
    // this._uiRoot.setImageManager(new WmzImageManager(this._uiRoot));
    // this._imageManager = this._uiRoot.getImageManager();
    return await super.parseSkin();
  }

  async loadKnowBitmaps() {
    const promises = [];
    promises.push(this.loadInline('<bitmap id="wa.main" file="main.bmp"/>'));
    promises.push(
      this.loadInline(`
    <bitmap id="prev" file="cbuttons.bmp"  x="0" y="0" h="18" w="23"/>
    <bitmap id="play" file="cbuttons.bmp"  x="23" y="0" h="18" w="23"/>
    <bitmap id="pause" file="cbuttons.bmp"  x="46" y="0" h="18" w="23"/>
    <bitmap id="stop" file="cbuttons.bmp"  x="69" y="0" h="18" w="23"/>
    <bitmap id="next" file="cbuttons.bmp"  x="92" y="0" h="18" w="22"/>
    <bitmap id="eject" file="cbuttons.bmp"  x="114" y="0" h="16" w="22"/>
  
    <bitmap id="prevp" file="cbuttons.bmp"  x="0" y="18" h="18" w="23"/>
    <bitmap id="playp" file="cbuttons.bmp"  x="23" y="18" h="18" w="23"/>
    <bitmap id="pausep" file="cbuttons.bmp"  x="46" y="18" h="18" w="23"/>
    <bitmap id="stopp" file="cbuttons.bmp"  x="69" y="18" h="18" w="23"/>
    <bitmap id="nextp" file="cbuttons.bmp"  x="92" y="18" h="18" w="22"/>
    <bitmap id="ejectp" file="cbuttons.bmp"  x="114" y="16" h="16" w="22"/>
    `)
    );

    promises.push(
      this.loadInline(`
    <!-- SONGTICKERFONT -->	
    <bitmapfont id="wasabi.font.default" file="text.bmp" charwidth="5" charheight="6" hspacing="0" vspacing="0"/>	
    `)
    );
    promises.push(this.loadBmp_bignum());

    promises.push(
      this.loadInline(`
    <bitmap id="player.status.mono.active" file="monoster.bmp" x="29" y="0" h="12" w="27"/>
    <bitmap id="player.status.mono.inactive" file="monoster.bmp" x="29" y="12" h="12" w="27"/>
    <bitmap id="player.status.stereo.active" file="monoster.bmp" x="0" y="0" h="12" w="29"/>
    <bitmap id="player.status.stereo.inactive" file="monoster.bmp" x="0" y="12" h="12" w="29"/>
        `)
    );

    promises.push(
      this.loadInline(`
    <bitmap id="posbarbg" file="posbar.bmp" x="0" y="0" w="248" h="10"/>
    <bitmap id="posbar" file="posbar.bmp" x="248" y="0" w="29" h="10"/>
    <bitmap id="posbarp" file="posbar.bmp" x="278" y="0" w="29" h="10"/>
      `)
    );
    promises.push(
      this.loadInline(`
    <bitmap id="rep" file="shufrep.bmp" x="0" y="0" w="28" h="15"/>
    <bitmap id="repp" file="shufrep.bmp" x="0" y="15" w="28" h="15"/>
    <bitmap id="repa" file="shufrep.bmp" x="0" y="30" w="28" h="15"/>
  
    <bitmap id="shuf" file="shufrep.bmp" x="28" y="0" h="15" w="47"/>
    <bitmap id="shufp" file="shufrep.bmp" x="28" y="15" h="15" w="47"/>
    <bitmap id="shufa" file="shufrep.bmp" x="28" y="30" h="15" w="47"/>
      `)
    );
    promises.push(
      this.loadInline(`
    <bitmap id="player.toggler.eq.disabled" file="shufrep.bmp" x="0" y="61" h="12" w="23"/>
    <bitmap id="player.toggler.eq.pressed" file="shufrep.bmp" x="46" y="73" h="12" w="23"/>
    <bitmap id="player.toggler.eq.enabled" file="shufrep.bmp" x="0" y="73" h="12" w="23"/>
    <bitmap id="player.toggler.pl.disabled" file="shufrep.bmp" x="23" y="61" h="12" w="23"/>
    <bitmap id="player.toggler.pl.pressed" file="shufrep.bmp" x="69" y="73" h="12" w="23"/>
    <bitmap id="player.toggler.pl.enabled" file="shufrep.bmp" x="23" y="73" h="12" w="23"/>  
      `)
    );
    promises.push(
      this.loadInline(`
    <bitmap id="volumes" file="volume.bmp" x="0" y="0" w="68" h="420"/>
    <bitmap id="volbtnd" file="volume.bmp" x="0" y="422" w="14" h="11"/>
    <bitmap id="volbtn" file="volume.bmp" x="15" y="422" w="14" h="11"/>
  
    <bitmap id="balances" file="balance.bmp" x="9" y="0" w="38" h="420"/>
    <bitmap id="panbtnd" file="balance.bmp" x="0" y="422" w="14" h="11"/>
    <bitmap id="panbtn" file="balance.bmp" x="15" y="422" w="14" h="11"/>      `)
    );
    promises.push(
      this.loadInline(`
    <bitmap id="wa.play" file="playpaus.bmp" x="0" y="0" w="9" h="9"/>
    <bitmap id="wa.pause" file="playpaus.bmp" x="9" y="0" w="9" h="9"/>
    <bitmap id="wa.stop" file="playpaus.bmp" x="18" y="0" w="9" h="9"/>
  
    <bitmap id="traffic.green" file="playpaus.bmp" x="36" y="0" w="3" h="9"/>
    <bitmap id="traffic.red" file="playpaus.bmp" x="39" y="0" w="3" h="9"/>
        `)
    );

    promises.push(
      this.loadInline(`
    <bitmap id="posbarsl" file="titlebar.bmp" x="17" y="36" w="3" h="7"/>
    <bitmap id="posbarsm" file="titlebar.bmp" x="20" y="36" w="3" h="7"/>
    <bitmap id="posbarsr" file="titlebar.bmp" x="23" y="36" w="3" h="7"/>
    <bitmap id="wa2.player.title.quit" file="titlebar.bmp" x="18" y="0" h="9" w="9"/>
    <bitmap id="wa2.player.title.quit.pressed" file="titlebar.bmp" x="18" y="9" h="9" w="9"/>
    <bitmap id="wa2.player.title.shade" file="titlebar.bmp" x="0" y="18" h="9" w="9"/>
    <bitmap id="wa2.player.title.shade.pressed" file="titlebar.bmp" x="9" y="18" h="9" w="9"/>
  
    <bitmap id="wa2.player.title.shademode" file="titlebar.bmp" x="0" y="27" h="9" w="9"/>
    <bitmap id="wa2.player.title.shademode.pressed" file="titlebar.bmp" x="9" y="27" h="9" w="9"/>
  
    <bitmap id="wa2.player.title.min" file="titlebar.bmp" x="9" y="0" h="9" w="9"/>
    <bitmap id="wa2.player.title.min.pressed" file="titlebar.bmp" x="9" y="9" h="9" w="9"/>
    <bitmap id="wa2.player.title.menu" file="titlebar.bmp" x="0" y="0" h="9" w="9"/>
    <bitmap id="wa2.player.title.menu.pressed" file="titlebar.bmp" x="0" y="9" h="9" w="9"/>
  
          `)
    );

    promises.push(
      this.loadInline(`
    <bitmap id="wa.titlebar.on" file="titlebar.bmp"  x="27" y="0" h="13" w="275"/>
    <bitmap id="wa.titlebar.off" file="titlebar.bmp"  x="27" y="15" h="13" w="275"/>
  
    <bitmap id="wa.switch.on" file="titlebar.bmp" x="0" y="36" w="18" h="18"/>	
    <bitmap id="wa.switch.pressed" file="titlebar.bmp" x="18" y="36" w="18" h="18"/>
  
    <bitmap id="menu" file="titlebar.bmp" x="0" y="0" w="9" h="9"/>
    <bitmap id="menup" file="titlebar.bmp" x="0" y="9" w="9" h="9"/>
  
    <bitmap id="mini" file="titlebar.bmp" x="9" y="0" w="9" h="9"/>
    <bitmap id="minip" file="titlebar.bmp" x="9" y="9" w="9" h="9"/>
  
    <bitmap id="close" file="titlebar.bmp" x="18" y="0" w="9" h="9"/>
    <bitmap id="closep" file="titlebar.bmp" x="18" y="9" w="9" h="9"/>
  
    <bitmap id="switch" file="titlebar.bmp"  x="0" y="18" h="9" w="9"/>
    <bitmap id="switchp" file="titlebar.bmp"  x="9" y="18" h="9" w="9"/>
  
    <!-- titlebar.png to titlebar.png -->
	<bitmap id="wa2.player.title.quit" file="titlebar.bmp" x="18" y="0" h="9" w="9"/>
	<bitmap id="wa2.player.title.quit.pressed" file="titlebar.bmp" x="18" y="9" h="9" w="9"/>
	<bitmap id="wa2.player.title.shade" file="titlebar.bmp" x="0" y="18" h="9" w="9"/>
	<bitmap id="wa2.player.title.shade.pressed" file="titlebar.bmp" x="9" y="18" h="9" w="9"/>

	<bitmap id="wa2.player.title.shademode" file="titlebar.bmp" x="0" y="27" h="9" w="9"/>
	<bitmap id="wa2.player.title.shademode.pressed" file="titlebar.bmp" x="9" y="27" h="9" w="9"/>

	<bitmap id="wa2.player.title.min" file="titlebar.bmp" x="9" y="0" h="9" w="9"/>
	<bitmap id="wa2.player.title.min.pressed" file="titlebar.bmp" x="9" y="9" h="9" w="9"/>
	<bitmap id="wa2.player.title.menu" file="titlebar.bmp" x="0" y="0" h="9" w="9"/>
	<bitmap id="wa2.player.title.menu.pressed" file="titlebar.bmp" x="0" y="9" h="9" w="9"/>

	<!-- Winshade Stuff -->
	<bitmap id="wa2.player.shade.enabled" file="titlebar.bmp" x="27" y="29" h="14" w="275"/>
	<bitmap id="wa2.player.shade.disabled" file="titlebar.bmp" x="27" y="42" h="14" w="275"/>

	<bitmap id="wa2.player.shade.menu" file="titlebar.bmp" x="0" y="0" h="9" w="9"/>
	<bitmap id="wa2.player.shade.menu.pressed" file="titlebar.bmp" x="0" y="9" h="9" w="9"/>

	<bitmap id="clutterbar" file="titlebar.bmp" x="304" y="0" w="8" h="43"/>

    `)
    );

    return Promise.all(promises);
  }

  async loadInline(strXml: string) {
    const parsed = parseXml(
      `<elements>${strXml}</elements>`
    ) as unknown as XmlElement;
    return await this.traverseChildren(parsed);
  }

  async loadKnowTXTs() {
    const txts = ["region.txt", "viscolor.txt", "PLEDIT.TXT"];
    return await Promise.all(
      txts.map(async (txt) => {
        if (!this._TXTs[txt]) {
          this._TXTs[txt] = await this._uiRoot._fileExtractor.getFileAsString(
            txt
          );
        }
      })
    );
  }

  async buildRegionTXT() {
    const regionTxt = this._TXTs["region.txt"];
    if (regionTxt) {
      const regionData = regionParser(regionTxt);
      const plane = [];
      plane.push('<svg height="0" width="0"><defs>');

      for (const [windowName, polygons] of Object.entries(regionData)) {
        // console.log('REGION:',windowName, polygons)
        plane.push(`<clipPath id="region-for-${windowName}">`);
        for (const polygon of polygons) {
          plane.push(`<polygon points="${polygon}"/>`);
        }
        plane.push(`</clipPath>`);
      }
      const svg = plane.join("");
      this._uiRoot._div.innerHTML = svg;
    }
  }

  async loadBmp_bignum() {
    //? Bignum = numfont.png | numbers.bmp | nums_ex.bmp
    // const getFile = this._uiRoot._fileExtractor.getFileAsBlob
    // let bignum = await getFile('numfont.png')
    // if(null != (await this._uiRoot._fileExtractor.getFileAsBlob('numfont.png'))){ // 0123456789- with transparency
    //   await this.loadInline(`<bitmapfont id="player.BIGNUM" file="numfont.png" charwidth="9" charheight="13" hspacing="3" vspacing="1"/>`);
    // } else
    if (
      null != (await this._uiRoot._fileExtractor.getFileAsBlob("nums_ex.bmp"))
    ) {
      // 0123456789- opaque
      await this.loadInline(
        `<bitmapfont id="player.BIGNUM" file="nums_ex.bmp" charwidth="9" charheight="13" hspacing="3" vspacing="1" wa2bignum="1"/>`
      );
    } else {
      await this.loadInline(
        `<bitmapfont id="player.BIGNUM" file="numbers.bmp" charwidth="9" charheight="13" hspacing="3" vspacing="1" wa2bignum="-1"/>`
      );
    }
    //force. also possibly set null:
    // const bitmap = this._uiRoot.getBitmap("player.BIGNUM")
    // await bitmap.ensureImageLoaded()
    // this._img = await this._uiRoot._imageManager.getImage(this._file);
  }

  /**
   * Inherit: Actual bitmap loading from wsz
   */
  // async _loadBitmaps() {
  //   const sources = this._popStreamSource();
  //   await super._loadBitmaps();
  //   this._pushAStreamSource(sources);
  // }

  /**
   * inherit: we allow /wsz_root/ to be / (root)
   */
  parseXmlFragment(xml: string): XmlElement {
    xml = xml.replace(/"skin\//gi, '"');
    return super.parseXmlFragment(xml);
  }

  //special case, wsz never use external/linked bitmap in its filename
  _isExternalBitmapFont(font: BitmapFont) {
    return false;
  }

  async eqvis(node: XmlElement, parent: any): Promise<EqVis> {
    const eqv = await super.eqvis(node, parent);

    if (this._uiRoot.hasBitmapFilepath("eqmain.bmp")) {
      // const sources = this._popStreamSource();
      //gradient lines
      let node: XmlElement = new XmlElement("bitmap", {
        id: "eq_gradient_line_",
        file: "eqmain.bmp",
        x: "115",
        y: "294",
        w: "1",
        h: "19",
      });
      await this.bitmap(node);
      eqv.setXmlAttr("colors", "eq_gradient_line_");

      //preamp
      node = new XmlElement("bitmap", {
        id: "eq_preamp_line_",
        file: "eqmain.bmp",
        x: "0",
        y: "314",
        w: "113",
        h: "1",
      });
      await this.bitmap(node);
      eqv.setXmlAttr("preamp", "eq_preamp_line_");
    }
    return eqv;
  }

  async vis(node: XmlElement, parent: any): Promise<Vis> {
    const vis = await super.vis(node, parent);

    const content = this._TXTs["viscolor.txt"];
    if (content) {
      const colors = parseViscolors(content);
      for (let i = 1; i <= 16; i++) {
        vis.setxmlparam(`colorband${i}`, colors[i]);
      }
      // vis.setxmlparam(`colorallbands`, colors[17]);
      for (let i = 1; i <= 5; i++) {
        vis.setxmlparam(`colorosc${i}`, colors[17 + i]);
      }
      vis.setxmlparam(`colorbandpeak`, colors[23]);
    }
    return vis;
  }
}

registerSkinEngine(ClassicSkinEngine);

const parseViscolors = (text: string): string[] => {
  const entries = text.split("\n");
  const regex = /^\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/;
  const colors = [
    "0,0,0",
    "24,33,41",
    "239,49,16",
    "206,41,16",
    "214,90,0",
    "214,102,0",
    "214,115,0",
    "198,123,8",
    "222,165,24",
    "214,181,33",
    "189,222,41",
    "148,222,33",
    "41,206,16",
    "50,190,16",
    "57,181,16",
    "49,156,8",
    "41,148,0",
    "24,132,8",
    "255,255,255",
    "214,214,222",
    "181,189,189",
    "160,170,175",
    "148,156,165",
    "150,150,150",
  ];
  entries
    .map((line) => regex.exec(line))
    .filter(Boolean)
    .map((matches) => (matches as RegExpExecArray).slice(1, 4).join(","))
    .map((rgb, i) => {
      colors[i] = rgb; // `rgb(${rgb})`;
    });
  console.log("VISCOLOR:", colors);
  return colors;
};
