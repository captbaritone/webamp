import * as Utils from "../../utils";
import UI_ROOT from "../../UIRoot";
import GuiObj from "./GuiObj";
import SystemObject from "./SystemObject";
import Movable from "./Movable";
import Layout from "./Layout";

const MOUSE_POS = { x: 0, y: 0 };

// TODO: Figure out how this could be unsubscribed eventually
document.addEventListener("mousemove", (e: MouseEvent) => {
  MOUSE_POS.x = e.clientX;
  MOUSE_POS.y = e.clientY;
});

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cgroup.2F.3E
export default class Group extends Movable {
  static GUID = "45be95e5419120725fbb5c93fd17f1f9";
  _inited: boolean = false;
  _parent: Group;
  _instanceId: string;
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean = true;
  _isLayout: boolean = false;
  _systemObjects: SystemObject[] = [];
  _actualWidth: number; // for _invalidatesize, after draw
  _actualHeight: number;
  _regionCanvas: HTMLCanvasElement;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "instance_id":
        this._instanceId = value;
        break;
      case "background":
        this._background = value;
        this._renderBackground();
        break;
      case "drawbackground":
        this._drawBackground = Utils.toBool(value);
        this._renderBackground();
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    if (this._inited) return;
    this._inited = true;

    super.init();

    for (const systemObject of this._systemObjects) {
      systemObject.init();
    }
    for (const child of this._children) {
      child.init();
    }
  }

  getId() {
    return this._instanceId || this._id;
  }

  addSystemObject(systemObj: SystemObject) {
    systemObj.setParentGroup(this);
    this._systemObjects.push(systemObj);
  }

  addChild(child: GuiObj) {
    child.setParent(this);
    this._children.push(child);
  }

  /* findobject(objectId: string): GuiObj | null {
    const lower = objectId.toLowerCase();
    for (const obj of this._children) {
      if (obj.getId() === lower) {
        return obj;
      }
      if (obj instanceof Group) {
        const found = obj.findobject(objectId);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  } */

  /* Required for Maki */
  getobject(objectId: string): GuiObj {
    const lower = objectId.toLowerCase();
    for (const obj of this._children) {
      if (obj.getId() === lower) {
        return obj;
      }
    }
    const foundIds = this._children.map((child) => child.getId()).join(", ");
    throw new Error(
      `Could not find an object with the id: "${objectId}" within object "${this.getId()}". Only found: ${foundIds}`
    );
  }

  enumobject(index: number): GuiObj {
    return this._children[index];
  }

  getnumobjects(): number {
    return this._children.length;
  }

  getmouseposx(): number {
    return MOUSE_POS.x - this.getparentlayout().getleft();
  }

  getmouseposy(): number {
    return MOUSE_POS.y - this.getparentlayout().gettop();
  }

  getparentlayout(): Layout {
    let obj: Group = this;
    while (obj._parent) {
      if (obj._isLayout) {
        break;
      }
      obj = obj._parent;
    }
    if (!obj) {
      console.warn("getParentLayout", this.getId(), "failed!");
    }
    return obj as Layout;
  }

  isLayout(): boolean {
    return this._isLayout;
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    const h = super.getheight();
    if (h == null && this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      if (bitmap) return bitmap.getHeight();
    }
    return h ?? 0;
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._autowidthsource) {
      const widthSource = this.findobject(this._autowidthsource);
      if (widthSource) {
        return widthSource.getautowidth();
      }
    }
    const w = super.getwidth();
    if (w == null && this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      if (bitmap) return bitmap.getWidth();
    }
    return w ?? 0;
  }

  _renderBackground() {
    if (this._background != null && this._drawBackground) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      this.setBackgroundImage(bitmap);
    } else {
      this.setBackgroundImage(null);
    }
  }

  // doResize() {
  //   super.doResize();
  // this._regionCanvas = null;
  //   //this.applyRegions();
  //   for (const child of this._children) {
  //     child.doResize();
  //   }
  // }
  async doResize() {
    UI_ROOT.vm.dispatch(this, "onresize", [
      { type: "INT", value: 0 },
      { type: "INT", value: 0 },
      { type: "INT", value: this.getwidth() },
      { type: "INT", value: this.getheight() },
    ]);
  }

  /**
   * it is needed because render region is expensive.
   * Hence, we recalculate regions only if needed */
  async _invalidateSize() {
    const actualBox = this._div.getBoundingClientRect();
    if (
      actualBox.width != this._actualWidth ||
      actualBox.height != this._actualHeight
    ) {
      this._actualWidth = actualBox.width;
      this._actualHeight = actualBox.height;
      this.doResize();
      this.applyRegions();
    }
    for (const child of this._children) {
      if (child instanceof Group) child._invalidateSize();
    }
  }

  // SYSREGION THINGS ==============================
  applyRegions() {
    this._regionCanvas = null;
    let hasRegions = false;
    for (const child of this._children) {
      // child.draw();
      if (child._sysregion == -1 || child._sysregion == -2) {
        this.putAsRegion(child);
        hasRegions = true;
      }
    }
    if (hasRegions) {
      this.setRegion();
    }
    this._regionCanvas = null;
  }

  putAsRegion(child: GuiObj) {
    if (
      this._regionCanvas == null ||
      this._regionCanvas.width == 0 ||
      this._regionCanvas.height == 0
    ) {
      const canvas = (this._regionCanvas = document.createElement("canvas"));
      const bound = this._div.getBoundingClientRect();
      canvas.width = bound.width;
      canvas.height = bound.height;
      // console.log('createRegionCanvas:', bound.width, bound.height)
      const ctx = canvas.getContext("2d");
      // const fs = ctx.fillStyle;
      ctx.fillStyle = "white";
      // ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, bound.width, bound.height);
      // ctx.fillStyle = 'transparent';
      // ctx.fillStyle = fs;
    }
    if (this._regionCanvas.width == 0 || this._regionCanvas.height == 0) {
      return;
    }

    if (child._sysregion == 1) {
      //just crop by transparency.
      const bitmap = child._backgroundBitmap;
      const ctxSrc = bitmap.getCanvas().getContext("2d");
      const dataSrc = ctxSrc.getImageData(
        0,
        0,
        bitmap.getWidth(),
        bitmap.getHeight()
      ).data;
      // const data = imageData.data;

      const ctx2 = this._regionCanvas.getContext("2d");
      const r = child._div.getBoundingClientRect();

      const imageData = ctx2.getImageData(
        r.left,
        r.top,
        bitmap.getWidth(),
        bitmap.getHeight()
      );
      const dataDst = imageData.data;
      for (var i = 0; i < dataDst.length; i += 4) {
        // data[i + 3] = data[i + 1] != 255 ? 0 : data[i + 1];
        dataDst[i + 0] = dataSrc[i + 3]; //? draw transparency
      }
      ctx2.putImageData(imageData, r.left, r.top);
    } else {
      const ctx2 = this._regionCanvas.getContext("2d");
      const r = child._div.getBoundingClientRect();
      const bitmap = child._backgroundBitmap;
      const img = child._backgroundBitmap.getImg();
      ctx2.drawImage(
        img,
        bitmap._x,
        bitmap._y,
        r.width,
        r.height,

        child._div.offsetLeft,
        child._div.offsetTop,
        // 0,0,
        r.width,
        r.height
        // bitmap._width, bitmap._height
        // 500, 500
      );
      // console.log('createDraw:',  child._div.offsetLeft - bitmap._x,
      // child._div.offsetTop - bitmap._y,
      // r.width, r.height,
      // r)
    }
  }

  setRegion() {
    if (this._regionCanvas.width == 0 || this._regionCanvas.height == 0) {
      return;
    }

    const ctx2 = this._regionCanvas.getContext("2d");

    const imageData = ctx2.getImageData(
      0,
      0,
      this._regionCanvas.width,
      this._regionCanvas.height
    );
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      // data[i + 3] = data[i + 1] != 255 ? 0 : data[i + 1];
      data[i + 3] = data[i + 0];
    }
    ctx2.putImageData(imageData, 0, 0);

    this._regionCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      this._div.style.setProperty("mask-image", `url(${url})`);
      this._div.style.setProperty("-webkit-mask-image", `url(${url})`);
    });

    // const url = this._regionCanvas.toDataURL();
    // this._div.style.setProperty('mask-image', `url(${url})`)
    // this._div.style.setProperty('-webkit-mask-image', `url(${url})`);
    // this._div.style.setProperty('--mask-image', `url(${url})`);
    // document.body.style.setProperty('background-image', `url(${url})`);
    // document.body.style.backgroundRepeat = 'no-repeat';
    // this._div.style.setProperty('mask-type', 'luminance')
    // this._div.style.setProperty('-webkit-mask-type', 'luminance')
  }

  draw() {
    super.draw();
    this._div.classList.add("webamp--img");
    // It seems Groups are not responsive to click events.
    if (this._movable || this._resizable) {
      // this._div.style.removeProperty('pointer-events');
      this._div.style.pointerEvents = "auto";
    } else {
      this._div.style.pointerEvents = "none";
    }
    //TODO: allow move/resize if has ._image
    this._div.style.pointerEvents = "none";
    // this._div.style.overflow = "hidden";
    this._renderBackground();
    for (const child of this._children) {
      child.draw();
      this._div.appendChild(child.getDiv());
    }
    if (this._autowidthsource) {
      // this._div.style.removeProperty('width');
      this._div.classList.add("autowidthsource");
    }
  }
}
