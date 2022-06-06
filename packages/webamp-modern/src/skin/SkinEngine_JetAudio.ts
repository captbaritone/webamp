import parseXml, { XmlElement } from "@rgrove/parse-xml";
import { FileExtractor } from "./FileExtractor";
import JskFileExtractor from "./jetAudioClasses/JskFileExtractor";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";

export class JetAudioSkinEngine extends SkinEngine {
  _config: {}; // whole index.json
  _alphaData: Uint8ClampedArray = null; // canvas.contex2d.data.data
  _fe: JskFileExtractor;

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".jsk");
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
    // return new JskFileExtractor();
    this._fe = new JskFileExtractor();
    return this._fe;
  }

  /**
   * Process
   */
  async parseSkin() {
    await this.loadKnowBitmaps();

    const container = await this.container(new XmlElement('container'))

    const xmlContent = await this.getMainJsc();
    const parsed = parseXml(xmlContent) as unknown as XmlElement;

    await this.asyncTraverseChildren(parsed, container);

  }

  async asyncTraverseChildren(node: XmlElement, parent: any = null) {
    return await Promise.all(
      node.children.map((child) => {
        if (child instanceof XmlElement) {
          // console.log('traverse->', parent.name, child.name)
          return this.traverseChild(child, parent);
        }
      })
    );
  }
  async traverseChildren(node: XmlElement, parent: any = null) {
    for (const child of node.children) {
      if (child instanceof XmlElement) {
        await this.traverseChild(child, parent);
      }
    }
  }

  async traverseChild(node: XmlElement, parent: any) {
    const tag = node.name.toLowerCase();
    switch (tag) {
    //   case "albumart":
    //     return this.albumart(node, parent);
    //   case "wasabixml":
    //     return this.wasabiXml(node, parent);
    //   case "winampabstractionlayer":
    //     return this.winampAbstractionLayer(node, parent);
    //   case "include":
    //     return this.include(node, parent);
      case "skin_description":
      case "skininfo":
        return this.skininfo(node, parent);
    //   case "elements":
    //     return this.elements(node, parent);
    //   case "bitmap":
    //     return this.bitmap(node);
    //   case "bitmapfont":
    //     return await this.bitmapFont(node);
    //   case "color":
    //     return await this.color(node, parent);
    //   case "groupdef":
    //     return this.groupdef(node, parent);
    //   case "animatedlayer":
    //     return this.animatedLayer(node, parent);
    //   case "images":
    //     return this.images(node, parent);
    //   case "layer":
    //     return this.layer(node, parent);
    //   case "container":
    //     return this.container(node);
    //   case "layoutstatus":
    //     return this.layoutStatus(node, parent);
    //   case "grid":
    //     return this.grid(node, parent);
    //   case "progressgrid":
    //     return this.progressGrid(node, parent);
    //   case "button":
    //     return this.button(node, parent);
    //   case "togglebutton":
    //     return this.toggleButton(node, parent);
    //   case "nstatesbutton":
    //     return this.nStateButton(node, parent);
    //   case "rect":
    //   case "group":
    //     return this.group(node, parent);
    //   case "groupxfade":
    //     return this.groupXFade(node, parent);
      case "layout":
      case "main":
    //   case "toolbar":
        return this.layout(node, parent);
    //   case "windowholder":
    //     return this.windowholder(node, parent);
    //   case "component":
    //     return this.component(node, parent);
    //   case "gammaset":
    //     return this.gammaset(node, parent);
    //   case "gammagroup":
    //     return this.gammagroup(node, parent);
    //   case "slider":
    //     return this.slider(node, parent);
    //   case "script":
    //     return this.script(node, parent);
    //   case "scripts":
    //     return this.scripts(node, parent);
    //   case "text":
    //     return this.text(node, parent);
    //   case "songticker":
    //     return this.songticker(node, parent);
    //   case "hideobject":
    //   case "sendparams":
    //     return this.sendparams(node, parent);
    //   case "wasabi:titlebar":
    //     return this.wasabiTitleBar(node, parent);
    //   case "wasabi:button":
    //     return this.wasabiButton(node, parent);
    //   case "truetypefont":
    //     return this.trueTypeFont(node, parent);
    //   case "eqvis":
    //     return this.eqvis(node, parent);
    //   case "colorthemes:mgr":
    //   case "colorthemes:list":
    //     return this.colorThemesList(node, parent);
    //   case "status":
    //     return this.status(node, parent);
      //? uncomment line below to localize error with XuiElement
      // case "wasabi:mainframe:nostatus":
      // case "wasabi:medialibraryframe:nostatus":
      // case "buttonled":
      // case "fadebutton":
      // case "fadetogglebutton":
      // case "configcheckbox":
      // case "configradio":
      //   return this.dynamicXuiElement(node, parent);
    //   case "elementalias":
    //     return this.elementalias(node);
    //   case "componentbucket":
    //     return this.componentBucket(node, parent);
    //   case "playlisteditor":
    //   case "wasabi:tabsheet":
    //   case "snappoint":
    //   case "accelerators":
    //   case "browser":
      case "syscmds":
        // TODO
        return;
      //   case "vis":
      // return this.vis(node, parent);
      case "skin":
      case "wrapper":
        return this.traverseChildren(node, parent);
      default:
        // // TODO: This should be the default fall through
        // if (this._uiRoot.getXuiElement(tag)) {
        //   return this.dynamicXuiElement(node, parent);
        // } else if (this._predefinedXuiNode(tag)) {
        //   return this.dynamicXuiElement(node, parent);
        // }
        console.warn(`Unhandled XML node type: ${node.name}`);
        return;
    }
  }

  async newGroup<Type>(
    Type,
    node: XmlElement,
    parent: any
  ): Promise<Awaited<Type>> {
    // return await this.newGui(Type, node, parent);
    const group = new Type(this._uiRoot);
    // await this.maybeApplyGroupDef(group, node);
    group.setXmlAttributes(node.attributes);
    await this.traverseChildren(node, group);
    this.addToGroup(group, parent);
    return group
  }

  async getMainJsc(): Promise<string> {
    let layout: string = await this._uiRoot.getFileAsString("main.jsc");
    //? JetAudio set an xml attribute without quote for numberic value
    //? but I don't want to provide a new xml parser. so let it be a valid xml
    layout = layout.replace(/= *(\d+)/g, (match, num) => `="${num}"`);
    layout = layout.replace(/---/g, tripledash => `--`);
    layout = layout.replace(/\0/g, tripledash => ``);
    console.log(layout);
    return layout;
  }

  // #region (collapsed) load-bitmap
  async loadKnowBitmaps() {
    for (const name of Object.keys(this._fe._toc)) {
      if (name == "main.jsc") continue;
      await this.bitmap(
        new XmlElement("bmp", {
          file: name,
          id: name,
        })
      );
    }
  }

  skininfo(node: XmlElement, parent: any) {
    const skinInfo = {};
    for (const child of node.children) {
      if (child instanceof XmlElement) {
        const tag = child.name.toLowerCase();
        skinInfo[tag] = child.text;
      }
    }
    this._uiRoot.setSkinInfo(skinInfo);
  }
}

registerSkinEngine(JetAudioSkinEngine);
