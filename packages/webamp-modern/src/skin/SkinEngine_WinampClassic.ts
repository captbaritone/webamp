import parseXml, { XmlElement } from "@rgrove/parse-xml";
import JSZip from "jszip";
import { UIRoot } from "../UIRoot";
import { assume } from "../utils";
import Bitmap from "./Bitmap";
import BitmapFont from "./BitmapFont";
import { WmzImageManager } from "./classicClasses/wmzImageManager";
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

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".wsz") || filePath.endsWith(".zip")  || filePath.endsWith("/");
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
    this._phase = RESOURCE_PHASE
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
    promises.push(this.loadInline('<bitmap id="wa.main" file="main.bmp"/>'))
    promises.push(this.loadInline(`	<bitmap id="prev" file="cbuttons.bmp"  x="0" y="0" h="18" w="23"/>
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
    <bitmap id="ejectp" file="cbuttons.bmp"  x="114" y="16" h="16" w="22"/>`))
   
    return Promise.all(promises);
  }

  async loadInline(strXml: string) {
    const parsed = parseXml(`<elements>${strXml}</elements>`) as unknown as XmlElement;
    return await this.traverseChildren(parsed);
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
    xml = xml.replace(/"skin\//gi, "\"");
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

    const content = await this._uiRoot.getFileAsStringZip("viscolor.txt");
    if (content) {
      const colors = parseViscolors(content);
      for (let i = 1; i < 16; i++) {
        vis.setxmlparam(`colorband${i}`, colors[i]);
      }
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
  return colors;
};
