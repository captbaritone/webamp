import { XmlElement } from "@rgrove/parse-xml";
import Bitmap from "./Bitmap";
import ButtonFace from "./faceClasses/ButtonFace";
import TimeFace from "./faceClasses/TimeFace";
import Group from "./makiClasses/Group";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";

export class SkinEngineAudion extends SkinEngine {
  _config: {}; // whole index.json
  _alphaData: Uint8ClampedArray = null; // canvas.contex2d.data.data

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".face") || filePath.endsWith(".zip");
  };

  static identifyByFile = (filePath: string): string => {
    return "index.json";
  };

  static priority: number = 3;

  /**
   * Process
   */
  async parseSkin() {
    console.log("RESOURCE_PHASE #################");
    // this._phase = RESOURCE_PHASE;

    const configContent = await this._uiRoot.getFileAsString("index.json");

    this._config = JSON.parse(configContent);

    // await this.traverseChildren(parsed);
    await this.loadKnowBitmaps();
    // await this._loadBitmaps();

    // console.log("GROUP_PHASE #################");
    // this._phase = GROUP_PHASE;
    const root = await this.getRootGroup();

    await this.loadTime(root);
    // animation
    // await this.laodConnectingAnimation(root);
    // await this.laodStreamingAnimation(root);
    // await this.laodNetLagAnimation(root);
    await this.laodAnimations(root);

    await this.laodIndicators(root);

    await this.loadButtons(root);

    await this.loadTexts(root);

    // return this._uiRoot;
  }

  // #region (collapsed) load-bitmap

  async loadKnowBitmaps() {
    await this.loadBase();
    // await this._loadBitmap("playButton");
  }

  /**
   * Special case, base*.png should be loaded first,
   * because it's dimension (width & height) are required immediately by
   * Container / Layout.
   */
  async loadBase() {
    await this.loadPlainBitmap("base-alpha.png");
    await this.loadBitmap("base.png");
  }

  //#endregion

  // #region (collapsed) load-button ==============================
  async loadButtons(parent: Group) {
    await this.loadButton("pause", parent, { rectName: "play" });
    await this.loadButton("play", parent, {
      attributes: { visible: "allowed-to:play" },
    });
    await this.loadButton("stop", parent);
    await this.loadButton("rewind", parent, {
      fileName: "rw",
      action: "prev",
      attributes: { enabled: "allowed-to:prev" },
    });
    await this.loadButton("fastForward", parent, {
      fileName: "ff",
      action: "next",
      attributes: { enabled: "allowed-to:next" },
    });
    await this.loadButton("eject", parent, { fileName: "eject" });
    await this.loadButton("playlist", parent, { fileName: "menu" });
    await this.loadButton("info", parent, { fileName: "info" });
    await this.loadButton("volume", parent, { fileName: "volume" });
    await this.loadButton("mode", parent, { fileName: "music" });
    await this.loadButton("close", parent);
  }

  async loadButton(
    name: string,
    parent: Group,
    options: {
      fileName?: string;
      rectName?: string;
      action?: string;
      attributes?: { [key: string]: string };
    } = {}
  ) {
    const fileName = options.fileName || name;
    const rectName = options.rectName || name;
    const actionName = options.action || name;
    const rect = this._config[`${rectName}ButtonRect`];

    //? bitmaps for the button
    await this.loadBitmap(`${fileName}.png`, `${name}`, rect.left, rect.top);

    await this.loadBitmap(
      `${fileName}-hover.png`,
      `${name}-hover`,
      rect.left,
      rect.top
    );
    await this.loadBitmap(
      `${fileName}-active.png`,
      `${name}-active`,
      rect.left,
      rect.top
    );
    await this.loadBitmap(
      `${fileName}-disabled.png`,
      `${name}-disabled`,
      rect.left,
      rect.top
    );

    //? button
    const attributes = options.attributes || {};
    const node = new XmlElement("button", {
      id: name,
      image: `${name}`,
      downImage: `${name}-active`,
      hoverImage: `${name}-hover`,
      disabledImage: `${name}-disabled`,
      action: actionName,
      x: `${rect.left}`,
      y: `${rect.top}`,
      w: `${rect.right - rect.left}`,
      h: `${rect.bottom - rect.top}`,
      ...attributes,
    });
    const button = await this.buttonFace(node, parent);
    // return button;
  }
  async buttonFace(node: XmlElement, parent: any) {
    return this.newGui(ButtonFace, node, parent);
  }

  //#endregion

  // #region (collapsed) Bitmap manipulation
  get alphaData(): Uint8ClampedArray {
    if (!this._alphaData) {
      const alphaBitmap = this._uiRoot.getBitmap("base-alpha.png");
      const canvasa = alphaBitmap.getCanvas();
      const ctxa = canvasa.getContext("2d");
      const imga = ctxa.getImageData(0, 0, canvasa.width, canvasa.height);
      this._alphaData = imga.data;
    }
    return this._alphaData;
  }

  /**
   * Load a bitmap from file, unmodified
   * @param name
   * @returns
   */
  async loadPlainBitmap(
    fileName: string,
    name: string = null
  ): Promise<Bitmap> {
    if (name == null) {
      name = fileName;
    }
    //* const rect = this._config[`${name}Rect`];
    const bitmap = await this.bitmap(
      new XmlElement("bitmap", { id: name, file: fileName })
    );
    // await bitmap.ensureImageLoaded(this._imageManager);
    return bitmap;
  }

  /**
   * Load bitmap and applyTransparency, auto remove if file is not exists
   * @param name filename eg play-button.png
   */
  async loadBitmap(
    fileName: string,
    name: string = null,
    dx: number = 0,
    dy: number = 0
  ): Promise<Bitmap> {
    if (name == null) name = fileName;
    const bitmap = await this.loadPlainBitmap(fileName, name);
    // sometime the Audion Face has no hover.png
    if (bitmap.loaded()) {
      await this.applyBaseTransparency(bitmap, dx, dy);
    } else {
      //no image? the bitmap isn't exists. destroy!
      this._uiRoot.removeBitmap(name);
      return null;
    }
    return bitmap;
  }
  /**
   * Copy transparency channel from base.png
   * @param bitmap the target bitmap
   * @param dx taken from target rect.left related to base
   * @param dy rect.top
   */
  async applyBaseTransparency(bitmap: Bitmap, dx: number, dy: number) {
    let anyPixelChanged: boolean = false;
    const canvasb = bitmap.getCanvas();
    const ctxb = canvasb.getContext("2d");
    const imgb = ctxb.getImageData(0, 0, canvasb.width, canvasb.height);
    const datab = imgb.data;
    const dataa = this.alphaData;
    const bw = bitmap.getWidth();
    const bh = bitmap.getHeight();
    const aw = this._uiRoot.getBitmap("base-alpha.png").getWidth();

    for (var y = 0; y < bh; y++) {
      for (var x = 0; x < bw; x++) {
        // // for (var i = 3; i < dataa.length; i += 4) {
        const b = y * bw + x;
        //? ignore transparent
        if (datab[b * 4 + 3] != 0) {
          const a = (y + dy) * aw + dx + x;
          datab[b * 4 + 3] = dataa[a * 4 + 3];
          anyPixelChanged = true;
        }
      }
    }

    // to reduce resource in RAM and avoid polution,
    // we do not add new resource if the bitmap is completely opaque
    if (anyPixelChanged) {
      ctxb.putImageData(imgb, 0, 0);

      // update img
      bitmap.setImage(canvasb);
    }
  }
  makeHoleInBase(rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }) {
    const bitmap = this._uiRoot.getBitmap("base.png");
    const canvas = bitmap.getCanvas();
    const ctx = canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;
    const bw = bitmap.getWidth();
    // const bh = bitmap.getHeight();
    let anyPixelChanged = false;

    for (var y = rect.top; y < rect.bottom; y++) {
      for (var x = rect.left; x < rect.right; x++) {
        const b = y * bw + x;
        //? ignore transparent
        if (data[b * 4 + 3] != 0) {
          data[b * 4 + 3] = 0;
          anyPixelChanged = true;
        }
      }
    }

    // to reduce resource in RAM and avoid polution,
    // we do not add new resource if the bitmap is completely opaque
    if (anyPixelChanged) {
      ctx.putImageData(img, 0, 0);

      // update img
      bitmap.setImage(canvas);
    }
  }
  //#endregion

  // #region (collapsed) SongTime & it's Bitmaps
  /*
  Gizmo2.0
  timeDigit1FirstPICTID 140 timeDigit1Rect
  timeDigit2FirstPICTID 160 timeDigit2Rect
  timeDigit3FirstPICTID 180 timeDigit3Rect
  timeDigit4FirstPICTID 191 timeDigit4Rect
  trackDigit1FirstPICTID 202
  trackDigit2FirstPICTID 213

  TokyoBay
  trackDigit1FirstPICTID 140
  trackDigit2FirstPICTID 160
  timeDigit1FirstPICTID 180 timeDigit1Rect
  timeDigit2FirstPICTID 200 timeDigit2Rect
  timeDigit3FirstPICTID 220 timeDigit3Rect
  timeDigit4FirstPICTID 240 timeDigit4Rect
  */

  async loadTime(parent: Group) {
    for (var i = 1; i <= 4; i++) {
      const start = this._config[`timeDigit${i}FirstPICTID`];
      await this.mergeBitmaps(start, 10, false, false, 0, 0, 0, 1);
      await this.loadTimePart(i, parent);
    }
  }

  async mergeBitmaps(
    start: number,
    count: number,
    vertical: boolean,
    applyBaseTransparency: boolean,
    dx: number = 0,
    dy: number = 0,
    skipX: number = 0,
    skipY: number = 0
  ): Promise<{ width: number; height: number }> {
    const filesPath = [];
    for (var i = start; i < start + count; i++) {
      filesPath.push(`${i}.png`);
      // console.log("loading merging bitmap:", i);
    }
    //? load bitmaps
    const bitmaps: Bitmap[] = await Promise.all(
      filesPath.map(async (filePath) => {
        // return await this.loadBitmap(filePath, filePath, dx, dy);
        // return this.loadPlainBitmap(filePath, filePath);
        return applyBaseTransparency
          ? this.loadBitmap(filePath, filePath, dx, dy)
          : this.loadPlainBitmap(filePath, filePath);
      })
    );

    //? get dimension
    const countX = vertical ? 1 + skipX : count + skipX;
    const countY = vertical ? count + skipY : 1 + skipY;
    const incX = vertical ? 0 : 1;
    const incY = vertical ? 1 : 0;
    // const bitmap = this._uiRoot.getBitmap(filesPath[0]);
    const bitmap = bitmaps[0];
    console.log("merge getBitmap:", filesPath[0]);
    const w = bitmap.getWidth();
    const h = bitmap.getHeight();
    // const canvas = bitmap.getCanvas();
    const canvas = document.createElement("canvas");
    canvas.width = w * countX;
    canvas.height = h * countY;
    const ctx = canvas.getContext("2d");

    //? merging process
    let x = w * skipX;
    let y = h * skipY;
    for (const abitmap of bitmaps) {
      ctx.drawImage(abitmap.getImg(), x, y);
      x += incX * w;
      y += incY * h;
    }
    //?update
    bitmap.setXmlAttr("w", `${canvas.width}`);
    bitmap.setXmlAttr("h", `${canvas.height}`);
    bitmap.setImage(canvas);

    //? delete unused
    for (const abitmap of bitmaps) {
      if (abitmap !== bitmap) {
        abitmap.setImage(null);
        abitmap.setXmlAttr("file", null);
        this._uiRoot.removeBitmap(abitmap.getId());
      }
    }

    return { width: w, height: h };
  }

  async loadTimePart(digit: number, parent: Group) {
    const start = this._config[`timeDigit${digit}FirstPICTID`];
    const rect = this._config[`timeDigit${digit}Rect`];
    const bitmap = this._uiRoot.getBitmap(`${start}.png`);
    const w = bitmap.getWidth() / 10;
    const h = bitmap.getHeight() / 2;

    //? bitmapfont
    let node = new XmlElement("bitmapfont", {
      id: `font-${bitmap.getId()}`,
      file: `${bitmap.getId()}`,
      charwidth: `${w}`,
      charheight: `${h}`,
    });
    const font = await this.bitmapFont(node);
    font.setImage(bitmap.getImg()); // external bitmap

    //? text
    node = new XmlElement("text", {
      id: `time-${digit}`,
      font: `${font.getId()}`,
      x: `${rect.left}`,
      y: `${rect.top}`,
      w: `${rect.right - rect.left}`,
      h: `${rect.bottom - rect.top}`,
      charwidth: `${w}`,
      charheight: `${h}`,
      // fontsize: `${h}`,
      // display: "time", // should be the last
      digit: `${digit}`,
    });
    const text = (await this.textFace(node, parent)) as TimeFace;
    text.setXmlAttr("display", "time");
    text.setXmlAttr("fontsize", `${h}`);
  }

  async textFace(node: XmlElement, parent: any): Promise<TimeFace> {
    return this.newGui(TimeFace, node, parent);
  }
  //#endregion

  // #region (collapsed) Animation
  async laodAnimations(parent: Group) {
    await Promise.all([
      this.laodAnimation("connecting", parent, true),
      // this.laodAnimation("streaming", parent),
      // this.laodAnimation("netLag", parent),
    ]);
  }

  async laodAnimation(
    prefix: string,
    parent: Group,
    makeHole: boolean = false
  ) {
    const start = this._config[`${prefix}FirstPICTID`];
    const count = this._config[`${prefix}NumPICTs`];
    const rect = this._config[`${prefix}AnimRect`];
    const delay = this._config[`${prefix}FrameDelay`];
    const frame = await this.mergeBitmaps(
      start,
      count,
      true,
      true,
      rect.left,
      rect.top
    );
    const node = new XmlElement("animatedLayer", {
      id: "${prefix}Anim",
      image: `${start}.png`,
      x: `${rect.left}`,
      y: `${rect.top}`,
      w: `${rect.right - rect.left}`,
      h: `${rect.bottom - rect.top}`,
      // frameheight: `${rect.bottom - rect.top + 1}`,
      frameheight: `${frame.height}`,
      speed: `${delay * 100}`,
      autoPlay: `1`,
      move: `1`,
      start: `0`,
      end: `${count - 1}`,
    });
    await this.animatedLayer(node, parent);
    if (makeHole) {
      this.makeHoleInBase(rect);
    }
  }
  // #endregion

  // #region (collapsed) Indicator
  async laodIndicators(parent: Group) {
    return await Promise.all([
      this.laodIndicator("MP3", parent),
      this.laodIndicator("CD", parent),
      this.laodIndicator("CDDB", parent),
      this.laodIndicator("net", parent),
    ]);
  }
  async laodIndicator(prefix: string, parent: Group) {
    const rect = this._config[`${prefix}IndicatorRect`];
    const bitmap = await this.loadBitmap(
      `${prefix}.png`,
      `${prefix}`,
      rect.left,
      rect.top
    );
    //test if this skin has bitmap
    if (!bitmap || !bitmap.loaded()) {
      this._uiRoot.removeBitmap(prefix);
      return;
    }

    await this.loadBitmap(
      `${prefix}-on.png`,
      `${prefix}-on`,
      rect.left,
      rect.top
    );

    const node = new XmlElement("layer", {
      id: `${prefix}Indicator`,
      image: `${prefix}`,
      x: `${rect.left}`,
      y: `${rect.top}`,
      w: `${rect.right - rect.left}`,
      h: `${rect.bottom - rect.top}`,
      // frameheight: `${rect.bottom - rect.top + 1}`,
    });
    await this.layer(node, parent);
  }
  //#endregion

  // #region (collapsed) Text
  async loadTexts(parent: Group) {
    this.loadText("artist", "songtitle", parent);
    this.loadText("album", "songinfo", parent);
  }
  async loadText(prefix: string, action: string, parent: Group) {
    const rect = this._config[`${prefix}DisplayRect`];
    // const color = this._config[`${prefix}DisplayTextFaceColorFromTxtr`];
    const textMode = this._config[`${prefix}TextMode`] == 0 ? "Face" : "Txtr";
    const color = this._config[`${prefix}DisplayTextFaceColorFrom${textMode}`];

    const node = new XmlElement("text", {
      id: `${prefix}-text`,
      text: `${action}`,
      display: `${action}`,
      ticker: `${1}`,
      color: `${color.red},${color.green},${color.blue}`,
      x: `${rect.left}`,
      y: `${rect.top}`,
      w: `${rect.right - rect.left}`,
      h: `${rect.bottom - rect.top}`,
    });
    await this.text(node, parent);
  }
  //#endregion

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

registerSkinEngine(SkinEngineAudion);
