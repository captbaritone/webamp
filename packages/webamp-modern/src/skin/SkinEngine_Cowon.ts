import parseXml, { XmlElement } from "@rgrove/parse-xml";
import UibFileExtractor from "./cowonClasses/uibFileExtractor";
import { FileExtractor } from "./FileExtractor";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";

type VisitFun = (node: XmlElement, parent: any) => Promise<any>;

export class CowonSkinEngine extends SkinEngine {
  _config: {}; // whole index.json
  _alphaData: Uint8ClampedArray = null; // canvas.contex2d.data.data
  _fe: UibFileExtractor;

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".uib");
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
    this._fe = new UibFileExtractor();
    return this._fe;
  }

  /**
   * Process
   */
  async parseSkin() {
    await this.loadKnowBitmaps();

    const container = await this.container(new XmlElement("container"));
    const layout = await this.layout(
      new XmlElement("container", { id: "main" }),
      container
    );

    // const xmlContent = await this.getMainJsc();
    // const parsed = parseXml(xmlContent) as unknown as XmlElement;

    // await this.asyncTraverseChildren(parsed, container, this.traverseRoot);
  }

  async asyncTraverseChildren(node: XmlElement, parent: any, visit: VisitFun) {
    return await Promise.all(
      node.children.map((child) => {
        if (child instanceof XmlElement) {
          // console.log('traverse->', parent.name, child.name)
          return visit(child, parent);
        }
      })
    );
  }
  async traverseChildren(
    node: XmlElement,
    parent: any = null,
    visit: VisitFun
  ) {
    for (const child of node.children) {
      if (child instanceof XmlElement) {
        await visit(child, parent);
      }
    }
  }

  /**
   * Scan root of xml.
   * All root (or direct child of root) are Layout, or a GroupDef
   * @param node
   * @param parent
   * @returns
   */
  async traverseRoot(node: XmlElement, parent: any) {
    const tag = node.name.toLowerCase();
    switch (tag) {
      case "skin_description":
        return this.skininfo(node, parent);
      case "layout":
      case "main":
      case "toolbar":
        return this.layout(node, parent);
      case "skin":
      case "wrapper":
        return this.traverseChildren(node, parent, this.traverseRoot);
      default:
        console.warn(`Unhandled XML node type: ${node.name}`);
        return;
    }
  }

  /**
   * Scan non root element. Usually a Group
   * @param node
   * @param parent
   * @returns
   */
  async traverseComponent(node: XmlElement, parent: any) {
    const tag = node.name.toLowerCase();
    switch (tag) {
      case "skin_description":
        return this.skininfo(node, parent);
      case "layout":
      case "main":
      case "toolbar":
        return this.layout(node, parent);
      case "skin":
      case "wrapper":
        return this.traverseChildren(node, parent, this.traverseRoot);
      default:
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
    await this.traverseChildren(node, group, this.traverseComponent);
    this.addToGroup(group, parent);
    return group;
  }

  async getMainJsc(): Promise<string> {
    let layout: string = await this._uiRoot.getFileAsString("main.jsc");
    //? JetAudio set an xml attribute without quote for numberic value
    //? but I don't want to provide a new xml parser. so let it be a valid xml
    layout = layout.replace(/= *(\d+)/g, (match, num) => `="${num}"`);
    layout = layout.replace(/---/g, (tripledash) => `--`);
    layout = layout.replace(/\0/g, (tripledash) => ``);
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

registerSkinEngine(CowonSkinEngine);
