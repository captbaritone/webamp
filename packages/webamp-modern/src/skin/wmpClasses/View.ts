import { UIRoot } from "../../UIRoot";
import { num } from "../../utils";
import Container from "../makiClasses/Container";
import Group from "../makiClasses/Group";
import GuiObj from "../makiClasses/GuiObj";
import Layout from "../makiClasses/Layout";
import { decodeWideChars } from "../SkinEngine_WindowsMediaPlayer";
import Theme from "./Theme";
import { runInlineScript } from "./util";

// https://docs.microsoft.com/en-us/windows/win32/wmp/view-element
export default class View extends Container {
  _clippingColor: string;
  _scriptFile: string;
  _onLoad: string;
  _timerInterval: number;
  _onTimer: string;
  _jsScript: { [key: string]: string } = {}; //wmp

  getElTag(): string {
    return "container";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "clippingcolor":
        this._clippingColor = value;
        break;
      case "scriptfile":
        this._scriptFile = value;
        this.addJsScript(value);
        break;
      case "onload":
        this._onLoad = value;
        break;
      case "timerinterval":
        this._timerInterval = num(value);
        break;
      case "ontimer":
        this._onTimer = value;
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    super.init();

    // this.loadJsScripts(); //done in skinengin

    const ctx = { view: this };

    // if (this._scriptFile) {
    //   this.prepareScriptGlobalObjects();
    //? temporary disabling due incomplete methods
    if (this._onLoad != null) {
      //   setTimeout(() => {
      runInlineScript(this._onLoad, ctx);
      //   }, 1000);
    }
    // }
    // pending onLoad
    if (this._onTimer && this._timerInterval != null) {
      setTimeout(() => {
        console.log("Blendshutter!?", this._onTimer);
        runInlineScript(this._onTimer, ctx);
      }, this._timerInterval);
    }
  }
  // getwidth():number {
  //   return this._activeLayout._w; // avoid getting bitmap.width
  // }
  // getheight():number {
  //   return this._activeLayout._h; // avoid getting bitmap.width
  // }

  get width(): number {
    return this.getWidth(); // container.getWidth
  }
  get height(): number {
    return this.getHeight(); // container.getHeight
  }
  set width(w: number) {
    this.setWidth(w);
  }
  set height(h: number) {
    this.setHeight(h);
  }

  //? WindowsMediaPlayer ========================
  addJsScript(js: string) {
    //* sample: scriptFile="personal.js;res://wmploc/RT_TEXT/#132"

    if (js.includes(";")) {
      js = js.substring(0, js.indexOf(";"));
      console.log(js);
    }
    this._jsScript[js] = js; //key'd because to avoid duplicate
  }
  async loadJsScripts() {
    for (const scriptPath of Object.keys(this._jsScript)) {
      const scriptContent = await this._uiRoot.getFileAsString(scriptPath);
      const scriptText = decodeWideChars(scriptContent);
      const script = document.createElement("script");
      script.textContent = scriptText;
      script.textContent += ";debugger;";
      script.type = "text/javascript";
      // TODO: register script loaded, to be unloadable.
      document.head.appendChild(script);
    }
  }

  prepareScriptGlobalObjects() {
    const theme = this._uiRoot.findContainer("theme") as Theme;
    // window["theme"] = theme;
    // window["mediacenter"] = theme.mediaCenter;
    window["view"] = this;

    const recursiveSetGlobal = (element: GuiObj) => {
      if (element.getOriginalId() != null) {
        window[element.getOriginalId()] = element;
        // console.log('set global:', element.getOriginalId())
      }
      if (element instanceof Group) {
        for (const child of element._children) {
          recursiveSetGlobal(child);
        }
      }
    };

    const layout = this.getcurlayout();
    recursiveSetGlobal(layout);
  }

  draw() {
    super.draw();

    //register self
    if (this.getOriginalId() != null) {
      window[this.getOriginalId()] = this;
      // console.log('set global:', element.getOriginalId())
    }

    if (this._scriptFile) {
      this.prepareScriptGlobalObjects();
      //   //? temporary disabling due incomplete methods
      //   if (this._onLoad) {
      //     setTimeout(() => {
      //       runInlineScript(this._onLoad);
      //     }, 1000);
      //   }
    }
  }
}
