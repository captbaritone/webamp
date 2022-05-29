import { XmlElement } from "@rgrove/parse-xml";
import Bitmap from "./Bitmap";
import { Edges } from "./Clippath";
import ButtonFace from "./faceClasses/ButtonFace";
import TimeFace from "./faceClasses/TimeFace";
import { FileExtractor } from "./FileExtractor";
import Container from "./makiClasses/Container";
import Group from "./makiClasses/Group";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";
import SgfFileExtractor from "./soniqueClasses/SgfFileExtractor";

type Rgn = {
  l: number;
  t: number;
  r: number;
  b: number;
  w?: number;
  h?: number;
};
export class SoniqueSkinEngine extends SkinEngine {
  _config: {}; // whole index.json
  _alphaData: Uint8ClampedArray = null; // canvas.contex2d.data.data

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".sgf");
  };

  static identifyByFile = (filePath: string): string => {
    return null;
  };

  static priority: number = 4;

  /**
   * Provide a special file extractor of Sonique skin
   * @returns An instance of custom FileExtractor
   */
  getFileExtractor(): FileExtractor {
    return new SgfFileExtractor();
  }

  /**
   * Process
   */
  async parseSkin() {
    console.log("RESOURCE_PHASE #################");
    // this._phase = RESOURCE_PHASE;

    await this.loadKnowBitmaps();

    const container = await this.loadContainer(); // player Container
    // which one declared first will become the default visible
    await this.loadMid(container);
    console.log(await this.getRegions("/rgn/nav/next"))
  }

  // #region (collapsed) load-bitmap
  async loadKnowBitmaps() {
    const knownBitmaps = [
      "extra",
      "midsonique",
      "misc",
      "navigator",
      "navitem1",
      "navitem2",
      "qsound/1",
      "shuttle",
      "skinthumb",
      "skinthumbmask",
      "smallknob",
      "smalllycoslogo",
      "smallstate",
      "splash",
      "volumeknob",
    ];
    for (const bitmapName of knownBitmaps) {
      await this.bitmap(
        new XmlElement("bitmap", {
          id: bitmapName,
          file: `/jpeg/${bitmapName}`,
        })
      );
    }
  }

  async getRegions(rgnId: string): Promise<Rgn[]> {
    const buffer = await this._uiRoot.getFileAsBytes(rgnId);
    const words = new Int16Array(buffer);
    const count = words[0];
    const regions: Rgn[] = [];
    //? we skip the first rect
    for (var i = 5; i < words.length; i += 4) {
      const rect = words.slice(i, i + 4);
      const [l, t, r, b] = [rect[0], rect[1], rect[2], rect[3]];
      regions.push({
        l,
        t,
        r,
        b,
        w: r - l,
        h: b - t,
      });
    }
    return regions;
  }
  // #endregion

  async loadContainer(): Promise<Container> {
    let node = new XmlElement("container", {
      id: "main",
      x: "0",
      y: "0",
    });
    const main = await this.container(node);
    return main;
  }

  async loadMid(parent: Container) {
    // const prefix = this._rc["prefix"];
    // const bg = await this.loadBitmap(this._rc["BackgroundImage"]);
    const bg = this._uiRoot.getBitmap(`midsonique`);
    let node = new XmlElement("layout", {
      id: "mid",
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const normal = await this.layout(node, parent);

    node = new XmlElement("group", {
      id: "mid-root",
      background: bg.getId(),
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const group = await this.group(node, normal);
    await this.applyRegion(group, '/rgn/mid/frame')

    node = new XmlElement("layer", {
      id: "mover",
      w: `0`,
      h: `0`,
      relatw: `1`,
      relath: `1`,
      // background: "base.png",
      move: "1",
    });
    const mover = await this.layer(node, group);

    // seek on kjofol default skin looked like cover the pitch. load it first
    // await this.loadSeek(this._rc, group);

    // await this.loadButton("Play", "play", group, this._rc);
    // await this.loadButton("Pause", "pause", group, this._rc);
    // await this.loadButton("Stop", "stop", group, this._rc);
    // await this.loadButton("PreviousSong", "previoussong", group, this._rc);
    // await this.loadButton("NextSong", "nextsong", group, this._rc);
    // await this.loadButton("OpenFile", "openfile", group, this._rc);

    // await this.loadTexts(group, this._rc);
    // await this.loadVis(group, this._rc);
    // await this.loadVolume(this._rc, group);
    // await this.loadPitch(this._rc, group);
    // // await this.loadSeek(this._rc, group);
    // await this.loadEqualizer(this._rc, group);

    // await this.loadToggleButton("Repeat", "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Repeat", group, this._rc);
    // await this.loadToggleButton("Shuffle", "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Shuffle", group, this._rc);
    // await this.loadButton("DockMode", "SWITCH;dock", group, this._rc);
    // await this.loadButton("Minimize", "SWITCH;shade", group, this._rc);
  }

  async applyRegion(group: Group, rgnId: string) {
    const regions = await this.getRegions(rgnId)
    const canvas = document.createElement("canvas");
    canvas.width = group.getwidth()
    canvas.height = group.getheight()
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";

    for(const region of regions){
      ctx.fillRect(region.l, region.t, region.w, region.h);
    }

    const edge = new Edges();
    edge.parseCanvasTransparency(canvas);
    if (!edge.isSimpleRect()) {
      group.getDiv().style.clipPath = edge.getPolygon();
      return;
    }
  }

  async getRootGroup(): Promise<Group> {
    let node: XmlElement = new XmlElement("container", { id: "root" });
    const container = await this.container(node);
    //get layout size
    const base = this._uiRoot.getBitmap("base.png");
    node = new XmlElement("layout", {
      id: "normal",
      w: `${base.getWidth()}`,
      h: `${base.getHeight()}`,
      background: "base.png",
    });
    const layout = await this.layout(node, container);
    // return layout as Group;
    node = new XmlElement("group", {
      id: "wrapper",
      w: `0`,
      h: `0`,
      relatw: `1`,
      relath: `1`,
      // background: "base.png",
      // move:"1"
    });
    const group = await this.group(node, layout);
    node = new XmlElement("layer", {
      id: "mover",
      w: `0`,
      h: `0`,
      relatw: `1`,
      relath: `1`,
      // background: "base.png",
      move: "1",
    });
    const mover = await this.layer(node, group);
    return group;
  }
}

registerSkinEngine(SoniqueSkinEngine);
