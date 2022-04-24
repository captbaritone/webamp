import parseXml, { XmlElement } from "@rgrove/parse-xml";
import { UIRoot } from "../UIRoot";
import BitmapFont from "./BitmapFont";
import SkinParser, {
  GROUP_PHASE,
  parseXmlFragment,
  RESOURCE_PHASE,
} from "./parse";

export default class ClassicSkinParser extends SkinParser {
  _wszRoot: string = "/assets/winamp_classic/";

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    // load internal wsz prototype from:
    uiRoot.setSkinDir("assets/winamp_classic/");
  }

  async _internalFile(fileName: string): Promise<string> {
    return await this._uiRoot.getFileAsStringPath(
      /* this._wszRoot + */ fileName
    );
  }

  async _parseInternalFile(fileName: string) {
    let content = await this._internalFile(fileName);
    content = content.replace(/wsz_root\//gi, "");
    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = parseXmlFragment(content);
    await this.traverseChildren(parsed);
  }

  async parse() {
    // Load built-in xui elements
    // await this.parseFromUrl("assets/xml/xui/standardframe.xml");

    console.log("RESOURCE_PHASE #################");
    this._phase = RESOURCE_PHASE;

    // Load built-in xui elements
    await this.loadFreeformXui();

    await this._parseInternalFile("xml/player-elements.xml");
    await this._parseInternalFile("xml/eq-elements.xml");

    await this._solveMissingBitmaps();
    await this._imageManager.loadUniquePaths();
    await this._imageManager.ensureBitmapsLoaded();

    console.log("GROUP_PHASE #################");
    this._phase = GROUP_PHASE;
    await this._parseInternalFile("xml/player.xml");
    //eqmain.bmp seem as not yet loaded, temporary disable:
    await this._parseInternalFile("xml/eq.xml");

    console.log("BUCKET_PHASE #################");
    await this.rebuildBuckets();

    return this._uiRoot;
  }

  //special loading mode. WSZ has no script.
  async script(node: XmlElement, parent: any) {
    // temporary hack
    const binFunc = this._uiRoot.getFileAsBytes;
    this._uiRoot.getFileAsBytes = this._uiRoot.getFileAsBytesPath;

    await super.script(node, parent);

    this._uiRoot.getFileAsBytes = binFunc;
  }

  //special case, wsz never use external/linked bitmap in its filename
  _isExternalBitmapFont(font: BitmapFont) {
    return false;
  }

  //   async bitmapFont(node: XmlElement) {
  //     // assume(
  //     //   node.children.length === 0,
  //     //   "Unexpected children in <bitmapFont> XML node."
  //     // );
  //     const font = new BitmapFont();
  //     font.setXmlAttributes(node.attributes);

  //       this._imageManager.addBitmap(font);
  //     }

  //     this._uiRoot.addFont(font);
  //   }
}
