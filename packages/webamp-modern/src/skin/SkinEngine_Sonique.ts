import { XmlElement } from "@rgrove/parse-xml";
import Bitmap from "./Bitmap";
import { Edges } from "./Clippath";
import { FileExtractor } from "./FileExtractor";
import GammaGroup from "./GammaGroup";
import Button from "./makiClasses/Button";
import Container from "./makiClasses/Container";
import Group from "./makiClasses/Group";
import ToggleButton from "./makiClasses/ToggleButton";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";
import CircleButton from "./soniqueClasses/CircleButton";
import IniFile, { IniSection } from "./soniqueClasses/IniFile";
import { MISC } from "./soniqueClasses/misc_ini";
import RingProgress from "./soniqueClasses/RingProgress";
import SgfFileExtractor from "./soniqueClasses/SgfFileExtractor";

type Rgn = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
export class SoniqueSkinEngine extends SkinEngine {
  _config: {}; // whole index.json
  _alphaData: Uint8ClampedArray = null; // canvas.contex2d.data.data
  _ini: IniFile;

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
    this._ini = new IniFile();
    this._ini.readString(MISC);
    const skinIni = await this._uiRoot.getFileAsString("/skin.ini");
    if (skinIni) {
      this._ini.readString(skinIni);
    }
    // console.log(JSON.stringify(this._ini._tree));
    console.log(this._ini._tree);

    console.log("RESOURCE_PHASE #################");
    // this._phase = RESOURCE_PHASE;

    await this.loadKnowBitmaps();
    await this.buildGammaSet();
    await this.loadColorizedBitmaps();

    const container = await this.loadContainer(); // player Container
    // which one declared first will become the default visible
    await this.loadMid(container);
    await this.loadNav(container);
    await this.loadSmall(container);
    // console.log(await this.getRegions("/rgn/nav/next"));
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

  async buildGammaSet() {
    const iColors = this._ini.section("sonique colors");
    const gammaSet = [];

    //? dummy
    const gammaGroups = [
      { id: "MidTop", value: "-3897,0,2394", gray: "0", boost: "0" },
      { id: "SystemColor_1", value: "-4096,0,0", gray: "0", boost: "0" },
      { id: "IconColor", value: "-4096,-4096,-4096", gray: "0", boost: "0" },
      {
        id: "BlueBallsColorHover",
        value: "-144,-144,-144",
        gray: "0",
        boost: "0",
      },
      // {id:"SystemColor_3", value:"-4096,0,0", gray:"0", boost:"0"},
    ];
    for (const gamma of gammaGroups) {
      console.log("gamma:", gamma.id, gamma.value, iColors.getString(gamma.id));
      const gammaGroup = new GammaGroup();
      gammaGroup.setXmlAttributes(gamma);
      gammaSet.push(gammaGroup);
    }

    //? real from .INI
    const knownColorsIni = [
      "BlueBallsColor",
      "SystemColor_1",
      "SystemColor_2",
      "SystemColor_3",
    ];
    function gamma(i: number): number {
      return ((i - 128) / 128) * 4096;
    }
    for (const colorName of knownColorsIni) {
      const { r, g, b, a } = iColors.getRGBA(colorName);
      const value = `${gamma(r)},${gamma(g)},${gamma(b)}`;
      console.log(
        "gamma:",
        colorName,
        value,
        [r, g, b, a],
        iColors.getString(colorName)
      );
      const gammaGroup = new GammaGroup();
      gammaGroup.setXmlAttributes({
        id: colorName,
        value,
      });
      gammaSet.push(gammaGroup);
    }

    this._uiRoot.addGammaSet("default", gammaSet);
  }

  async loadColorizedBitmaps() {
    const knownBitmaps = [
      "down",
      "up",
      "minus",
      "close",
      "down2",
      "up2",
      "infinity",
      "right",
      "first",
      "prev",
      "play",
      "pause",
      "next",
      "last",
      "stop",
      "eject",
      "help",
    ];
    let i = 0;
    for (const bitmapName of knownBitmaps) {
      await this.bitmap(
        new XmlElement("bitmap", {
          // file: '/jpeg/navitem1',
          file: "/png/navitem",
          id: `nav.${bitmapName}`,
          x: `${i * 10}`,
          y: "0",
          w: "10",
          h: "10",
          gammagroup: "IconColor",
          // gammagroup: 'BlueBallsColor',
          // gammagroup: 'SystemColor_3',
        })
      );
      i++;
    }

    //? button circle
    await this.bitmap(
      new XmlElement("bitmap", {
        file: "/png/navitem",
        id: `nav.item.normal`,
        x: `181`,
        y: "0",
        w: "10",
        h: "10",
        gammagroup: "BlueBallsColor",
        // gammagroup: 'SystemColor_3',
      })
    );
    await this.bitmap(
      new XmlElement("bitmap", {
        file: "/png/navitem",
        id: `nav.item.hover`,
        x: `181`,
        y: "0",
        w: "10",
        h: "10",
        // gammagroup: 'BlueBallsColor',
        gammagroup: "BlueBallsColorHover",
      })
    );
  }

  moveRegions(regions: Rgn[], dx: number, dy: number) {
    for (var i = 0; i < regions.length; i++) {
      regions[i].left += dx;
      regions[i].right += dx;
      regions[i].top += dy;
      regions[i].bottom += dy;
    }
  }
  async getRegions(rgnId: string, skipFirst: boolean = true): Promise<Rgn[]> {
    rgnId = rgnId.toLowerCase();
    const buffer = await this._uiRoot.getFileAsBytes(rgnId);
    const words = new Int16Array(buffer);
    // const count = words[0];
    const regions: Rgn[] = [];
    const start = skipFirst ? 5 : 1;
    for (var i = start; i < words.length; i += 4) {
      const rect = words.slice(i, i + 4);
      const [l, t, r, b] = [rect[0], rect[1], rect[2], rect[3]];
      regions.push({
        left: l,
        top: t,
        right: r,
        bottom: b,
        width: r - l,
        height: b - t,
      });
    }
    return regions;
  }
  async getRect(rgnId: string): Promise<Rgn> {
    const rects = await this.getRegions(rgnId, false);
    return rects[0];
  }

  /**
   * Create a new bitmap used as mask by RingProgress
   * @param id bitmapMask's id
   * @param regionId filename of region path
   * @param ImageId backgound bitmap id used for creating mask
   * @returns same as param `id`
   */
  async mask(id: string, regionId: string, ImageId: string): Promise<string> {
    let regions = await this.getRegions(regionId, false);
    // just quick pop the first
    regions.reverse();
    let rect = regions.pop();
    regions.reverse();
    const bitmap = await this.bitmap(
      new XmlElement("bitmap", {
        id,
        file: "",
        // x: `${rect.left}`,
        // y: `${rect.top}`,
        w: `${rect.width}`,
        h: `${rect.height}`,
      })
    );
    // bitmap.ensureImageLoaded(this._imageManager)

    const bg = this._uiRoot.getBitmap(ImageId);
    const bgCanvas = bg.getCanvas();

    //? from now we are working in local. (top=0,left=0)
    this.moveRegions(regions, -rect.left, -rect.top);
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    const w = (canvas.width = rect.width);
    const h = (canvas.height = rect.height);
    // const canvas = bitmap.getCanvas()
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgCanvas, rect.left, rect.top, w, h, 0, 0, w, h);

    const idata = ctx.getImageData(0, 0, w, h);
    const data = idata.data;
    //? set alpha = zero
    for (var i = 0; i < data.length; i += 4) {
      data[i + 3] = 0;
    }
    //? set alpha > zero if any
    for (var region of regions) {
      for (var y = region.top; y < region.bottom; y++) {
        for (var x = region.left; x < region.right; x++) {
          var i = (y * w + x) * 4;
          var a = Math.floor((data[i + 0] + data[i + 1] + data[i + 2]) / 3);
          data[i + 3] = a;
        }
      }
    }
    ctx.putImageData(idata, 0, 0);
    bitmap.setImage(canvas);

    return id;
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

  // #region (collapsed) layout: MID
  async loadMid(parent: Container) {
    const prefix = "mid";
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
    await this.applyRegion(group, "/rgn/mid/frame");

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

    await this.loadButton("eject", "switch;nav", group, { position: "RED" });

    await this.loadButton("play", "play", group);
    await this.loadButton("pause", "pause", group);
    await this.loadButton("stop", "stop", group, {
      rectName: "play",
      attributes: { visible: "audio:play", image: "splash" },
    });
    await this.loadButton("next", "next", group);
    await this.loadButton("prev", "prev", group);
    await this.loadButton("eject", "eject", group, { position: "ORANGE" });
    // await this.loadButton("shuffle", "eject", group);
    // await this.loadButton("PreviousSong", "previoussong", group, this._rc);
    // await this.loadButton("NextSong", "nextsong", group, this._rc);
    // await this.loadButton("OpenFile", "openfile", group, this._rc);

    // await this.loadTexts(group, this._rc);
    // await this.loadVis(group, this._rc);
    // await this.loadVolume(this._rc, group);
    // await this.loadPitch(this._rc, group);
    // // await this.loadSeek(this._rc, group);
    // await this.loadEqualizer(this._rc, group);

    await this.loadToggleButton(
      "Repeat",
      "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Repeat",
      group,
      { position: "CYAN" }
    );
    await this.loadToggleButton(
      "Shuffle",
      "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Shuffle",
      group,
      { position: "GREEN" }
    );
    // await this.loadButton("DockMode", "SWITCH;dock", group, this._rc);
    // await this.loadButton("Minimize", "SWITCH;shade", group, this._rc);

    await this.loadMidTop(group);
    await this.loadMidBottom(group);
  }

  async loadMidTop(parent: Group) {
    //? playList progres
    const iColors = this._ini.section("sonique colors");
    const playListColors: string[] = [];
    for (var i = 1; i <= 2; i++) {
      playListColors.push(iColors.getString(`PlayListColor_${i}`));
    }
    // console.log('plTop:', playListColors)
    let rect = await this.getRect("/rgn/mid/listposring");
    // let regions = await this.getRegions("/rgn/mid/listposring");
    // this.moveRegions(regions, -rect.left, -rect.top);

    // ProgressBkColor
    await this.newGui(
      RingProgress,
      new XmlElement("dummy", {
        id: `playlist-progress`,
        // region: `/rgn/mid/songposring`,
        // regions: JSON.stringify(regions),
        // background: "midsonique",
        colors: `${playListColors.join(",")}`,
        bgcolor: iColors.getString("ProgressBkColor") || "grey",
        mask: await this.mask("pl-mask", "/rgn/mid/listposring", "midsonique"), // id
        degree: this._ini.getInt("misc values", "mid_playlistmode")
          ? "270"
          : "360",
        x: `${rect.left}`,
        y: `${rect.top}`,
        w: `${rect.width}`,
        h: `${rect.height}`,
      }),
      parent
    );

    rect = await this.getRect("/rgn/mid/top");
    const room = await this.group(
      // RingProgress,
      new XmlElement("dummy", {
        id: `top-room`,
        // region: `/rgn/mid/songposring`,
        // regions: JSON.stringify(regions),
        // background: "midsonique",
        // colors: `${playListColors.join(",")}`,
        // bgcolor: iColors.getString("ProgressBkColor") || "grey",
        // mask: await this.mask("pl-mask", "/rgn/mid/listposring", "midsonique"), // id
        // degree: this._ini.getInt("misc values", "mid_playlistmode")
        //   ? "270"
        //   : "360",
        x: `${rect.left}`,
        y: `${rect.top}`,
        w: `${rect.width}`,
        h: `${rect.height}`,
      }),
      parent
    );

    await this.loadCircleButton("SingleUp", "SWITCH;nav", room, {
      image: "nav.up",
    });
    await this.loadCircleButton("SingleDown", "SWITCH;small", room, {
      image: "nav.down",
    });
    await this.loadCircleButton("Help", "", room, { image: "nav.help" });
    await this.loadCircleButton("Minimize", "", room, { image: "nav.minus" });
    await this.loadCircleButton("Close", "", room, { image: "nav.close" });
  }

  async loadMidBottom(parent: Group) {
    //? song progres
    const iColors = this._ini.section("sonique colors");
    const progressColors: string[] = [];
    for (var i = 1; i <= 3; i++) {
      progressColors.push(iColors.getString(`ProgressColor_${i}`));
    }

    let rect = await this.getRect("/rgn/mid/songposring");
    await this.newGui(
      RingProgress,
      new XmlElement("dummy", {
        id: `song-progress`,
        action: "seek",
        // region: `/rgn/mid/songposring`,
        // background: "midsonique",
        colors: `${progressColors.join(",")}`,
        bgcolor: iColors.getString("ProgressBkColor") || "grey",
        mask: await this.mask(
          "song-mask",
          "/rgn/mid/songposring",
          "midsonique"
        ), // id
        x: `${rect.left}`,
        y: `${rect.top}`,
        w: `${rect.width}`,
        h: `${rect.height}`,
      }),
      parent
    );

    //? show current song
    const outer = await this.getRect("/rgn/mid/bottom");
    let regions = await this.getRegions("/rgn/mid/bottom");
    const halfWidth = outer.width / 2;
    regions = [{ ...outer }, ...regions];
    this.moveRegions(regions, -outer.left, -outer.top);
    let first: boolean = true;
    const p1: string[] = [];
    const p2: string[] = [];
    for (const region of regions) {
      let { left, top, right, bottom } = region;
      right--;
      bottom--;
      if (first) {
        first = false;
        // outer = region;
        //? left
        p1.push(`${left}px ${bottom}px`);
        p1.push(`${left}px ${top}px`);
        //? right
        p2.push(`${right - halfWidth}px ${bottom}px`);
        p2.push(`${right - halfWidth}px ${top}px`);
        continue;
      }
      //? left
      p1.push(`${left}px ${top}px`);
      p1.push(`${left}px ${bottom}px`);
      //? right
      p2.push(`${right - halfWidth}px ${top}px`);
      p2.push(`${right - halfWidth}px ${bottom}px`);
    }
    this._uiRoot.addAdditionalCss(`--bottom-arc1: polygon(${p1.join(", ")});`);
    this._uiRoot.addAdditionalCss(`--bottom-arc2: polygon(${p2.join(", ")});`);

    const circle = await this.group(
      new XmlElement("dummy", {
        id: `bottom-circle`,
        // file: `/jpeg/misc`,
        x: `${outer.left}`,
        y: `${outer.top}`,
        w: `${outer.width}`,
        h: `${outer.height}`,
      }),
      parent
    );
    circle.getDiv().classList.add("text-shaped");
    // circle
    //   .getDiv()
    //   .style.setProperty("--shape-outline", `polygon(${p1.join(", ")})`);

    const circle2 = await this.group(
      new XmlElement("dummy", {
        id: `bottom-inner-circle`,
        // file: `/jpeg/misc`,
        x: `0`,
        y: `0`,
        relatw: `1`,
        relath: `1`,
      }),
      circle
    );

    circle2.getDiv().classList.add("text-shaped");
    circle2.getDiv().classList.add("right");
    // circle2
    //   .getDiv()
    //   .style.setProperty("--shape-outline", `polygon(${p2.join(", ")})`);

    circle2.getDiv().innerText = `Experience design is the design of medium, or across media, with human experience as an
    explicit outcome, and human engagement as an explicit goal. more text test.more text test.more text test.more text test.more text test.more text test.more text test.more text test.more text test.more text test.more text test.`;
  }
  //#endregion

  // #region (collapsed) layout: NAV
  async loadNav(parent: Container) {
    const prefix = "nav";
    // const bg = await this.loadBitmap(this._rc["BackgroundImage"]);
    const bg = this._uiRoot.getBitmap(`navigator`);
    let node = new XmlElement("layout", {
      id: prefix,
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const normal = await this.layout(node, parent);

    node = new XmlElement("group", {
      id: `${prefix}-root`,
      background: bg.getId(),
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const group = await this.group(node, normal);
    await this.applyRegion(group, `/rgn/${prefix}/frame`);

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

    await this.loadButton("play", "play", group);
    await this.loadButton("pause", "pause", group);
    await this.loadButton("stop", "stop", group, {
      rectName: "play",
      attributes: { visible: "audio:play", image: "splash" },
    });
    await this.loadButton("next", "next", group);
    await this.loadButton("prev", "prev", group);
    await this.loadButton("eject", "eject", group, { position: "ORANGE" });
    // await this.loadButton("shuffle", "eject", group);
    // await this.loadButton("PreviousSong", "previoussong", group, this._rc);
    // await this.loadButton("NextSong", "nextsong", group, this._rc);
    // await this.loadButton("OpenFile", "openfile", group, this._rc);

    // await this.loadTexts(group, this._rc);
    // await this.loadVis(group, this._rc);
    // await this.loadVolume(this._rc, group);
    // await this.loadPitch(this._rc, group);
    // // await this.loadSeek(this._rc, group);
    // await this.loadEqualizer(this._rc, group);

    await this.loadToggleButton(
      "Repeat",
      "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Repeat",
      group,
      { position: "CYAN" }
    );
    await this.loadToggleButton(
      "Shuffle",
      "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Shuffle",
      group,
      { position: "GREEN" }
    );
    // await this.loadButton("DockMode", "SWITCH;dock", group, this._rc);
    // await this.loadButton("Minimize", "SWITCH;shade", group, this._rc);
  }
  //#endregion

  // #region (collapsed) layout: NAV
  async loadSmall(parent: Container) {
    const prefix = "small";
    // const bg = await this.loadBitmap(this._rc["BackgroundImage"]);
    const bg = this._uiRoot.getBitmap(`smallstate`);
    let node = new XmlElement("layout", {
      id: prefix,
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const normal = await this.layout(node, parent);

    node = new XmlElement("group", {
      id: `${prefix}-root`,
      background: bg.getId(),
      w: `${bg.getWidth()}`,
      h: `${bg.getHeight()}`,
    });
    const group = await this.group(node, normal);
    await this.applyRegion(group, `/rgn/${prefix}/frame`);

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

    // await this.loadButton("play", "play", group);
    // await this.loadButton("pause", "pause", group);
    // await this.loadButton("stop", "stop", group, {
    //   rectName: "play",
    //   attributes: { visible: "audio:play", image: "splash" },
    // });
    // await this.loadButton("next", "next", group);
    // await this.loadButton("prev", "prev", group);
    // await this.loadButton("eject", "eject", group, { position: "ORANGE" });

    // await this.loadToggleButton(
    //   "Repeat",
    //   "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Repeat",
    //   group,
    //   { position: "CYAN" }
    // );
    // await this.loadToggleButton(
    //   "Shuffle",
    //   "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Shuffle",
    //   group,
    //   { position: "GREEN" }
    // );
    // await this.loadButton("DockMode", "SWITCH;dock", group, this._rc);
    // await this.loadButton("Minimize", "SWITCH;shade", group, this._rc);
  }
  //#endregion

  async applyRegion(group: Group, rgnId: string) {
    const regions = await this.getRegions(rgnId);
    const canvas = document.createElement("canvas");
    canvas.width = group.getwidth();
    canvas.height = group.getheight();
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";

    //? skip the first
    // let first = true;
    for (const region of regions) {
      // if(first){
      //   first = false;
      //   continue
      // }
      ctx.fillRect(region.left, region.top, region.width, region.height);
    }

    const edge = new Edges();
    edge.parseCanvasTransparency(canvas);
    if (!edge.isSimpleRect()) {
      group.getDiv().style.clipPath = edge.getPolygon();
      return;
    }
  }

  async loadButton(
    nick: string,
    action: string,
    parent: Group,
    options: {
      fileName?: string;
      rectName?: string;
      action?: string;
      position?: string;
      attributes?: { [key: string]: string };
    } = {}
  ) {
    // /rgn/mid/frame
    // "/rgn/mid/play"
    const rectName = options.rectName || nick;
    const layout = parent.getparentlayout().getId();
    const regId = `/rgn/${layout}/${rectName}`;
    const { left, top, width, height } = await this.getRect(regId);
    let param = "";
    if (action.includes(";")) {
      [action, param] = action.split(";");
    }
    const attributes = options.attributes || {};
    const position = options.position || nick;

    const misc: IniSection = this._ini.section("misc locations");
    //? imageDown
    var x: string, y: string;
    if ((x = misc.getString(`${position.toLowerCase()}on_x`))) {
      y = misc.getString(`${position.toLowerCase()}on_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-on`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["downImage"] = `${nick}-on`;
    }
    if ((x = misc.getString(`${position.toLowerCase()}_x`))) {
      y = misc.getString(`${position.toLowerCase()}_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-on`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["downImage"] = `${nick}-on`;
    }
    //? image
    if ((x = misc.getString(`${position.toLowerCase()}off_x`))) {
      y = misc.getString(`${position.toLowerCase()}off_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-off`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["image"] = `${nick}-off`;
    }

    //? button
    const node = new XmlElement("button", {
      id: nick,
      action,
      param,
      // tooltip,
      x: `${left}`,
      y: `${top}`,
      w: `${width}`,
      h: `${height}`,
      // downimage: `${prefix}-${downimage}`,
      ...attributes,
    });
    const button = await this.button(node, parent);
    return button;
  }

  async loadToggleButton(
    nick: string,
    cfgattrib: string,
    parent: Group,
    options: {
      fileName?: string;
      rectName?: string;
      action?: string;
      position?: string;
      attributes?: { [key: string]: string };
    } = {}
  ) {
    // const prefix = config["prefix"];
    // const rect = config[`${nick}Button`];
    // if (!rect) return;
    // // console.log("rect:", rect);
    // const [left, top, right, bottom, tooltip, downimage] = rect;
    const rectName = options.rectName || nick;
    const layout = parent.getparentlayout().getId();
    const regId = `/rgn/${layout}/${rectName}`;
    const { left, top, width, height } = await this.getRect(regId);

    const attributes = options.attributes || {};
    const position = options.position || nick;

    const misc: IniSection = this._ini.section("misc locations");

    //? imageDown
    var x: string, y: string;
    if ((x = misc.getString(`${position.toLowerCase()}on_x`))) {
      y = misc.getString(`${position.toLowerCase()}on_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-on`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["downImage"] = `${nick}-on`;
      attributes["activeImage"] = `${nick}-on`;
    }
    if ((x = misc.getString(`${position.toLowerCase()}_x`))) {
      y = misc.getString(`${position.toLowerCase()}_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-on`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["downImage"] = `${nick}-on`;
      attributes["activeImage"] = `${nick}-on`;
    }
    //? image
    if ((x = misc.getString(`${nick.toLowerCase()}off_x`))) {
      y = misc.getString(`${nick.toLowerCase()}off_y`);
      await this.bitmap(
        new XmlElement("bitmap", {
          id: `${nick}-off`,
          file: `/jpeg/misc`,
          x,
          y,
          w: `${width}`,
          h: `${height}`,
        })
      );
      attributes["image"] = `${nick}-off`;
    }

    const node = new XmlElement("button", {
      id: nick,
      cfgattrib,
      cfgval: "2",
      // tooltip,
      x: `${left}`,
      y: `${top}`,
      w: `${width}`,
      h: `${height}`,
      // activeImage: `${prefix}-${downimage}`,
      ...attributes,
    });
    const button = await this.newGui(ToggleButton, node, parent);
    return button;
  }

  async loadCircleButton(
    nick: string,
    action: string,
    parent: Group,
    options: {
      fileName?: string;
      rectName?: string;
      action?: string;
      image?: string;
      // msm?: string;
      attributes?: { [key: string]: string };
    } = {}
  ) {
    // const prefix = config["prefix"];
    // const rect = config[`${nick}Button`];
    // if (!rect) return;
    // // console.log("rect:", rect);
    // const [left, top, right, bottom, tooltip, downimage] = rect;
    // const rectName = options.rectName || nick;
    // const layout = parent.getparentlayout().getId();
    // const regId = `/rgn/${layout}/${rectName}`;
    // const { left, top, width, height } = await this.getRect(regId);

    // const attributes = options.attributes || {};
    // const position = options.position || nick;

    let param = "";
    if (action.includes(";")) {
      [action, param] = action.split(";");
    }

    const msm: IniSection = this._ini.section("msm locations");

    const x = msm.getString(`msm_${nick}_x`);
    const y = msm.getString(`msm_${nick}_y`);
    const w = "10";
    const h = "10";

    const node = new XmlElement("button", {
      id: nick,
      action,
      param,
      // image: options.image,
      image: "nav.item.normal",
      hoverImage: "nav.item.hover",
      iconImage: options.image,
      x,
      y,
      w,
      h,
    });
    const button = await this.newGui(CircleButton, node, parent);
    return button;
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
