import parseXml, { XmlDocument, XmlElement } from "@rgrove/parse-xml";
import Parser from "@rgrove/parse-xml/src/lib/Parser";
import JSZip from "jszip";
import { UIRoot } from "../UIRoot";
// import { decodeWideChars } from "../utils";
import BitmapFont from "./BitmapFont";
import EqVis from "./makiClasses/EqVis";
import PlayListGui from "./makiClasses/PlayListGui";
// import Vis from "./makiClasses/Vis";
// import Avs from "./makiClasses/Avs";
import { GROUP_PHASE, RESOURCE_PHASE } from "./SkinEngine_WAL";
import { registerSkinEngine, SkinEngine } from "./SkinEngine";
import ButtonElement from "./wmpClasses/ButtonElement";
import ButtonGroup from "./wmpClasses/ButtonGroup";
import ButtonZ from "./wmpClasses/Button";
import Player from "./wmpClasses/Player";
import PlayListGuiZ from "./wmpClasses/PlayListGui";
import SliderZ from "./wmpClasses/Slider";
import SubView from "./wmpClasses/SubView";
import TextZ from "./wmpClasses/Text";
import Theme from "./wmpClasses/Theme";
import View from "./wmpClasses/View";
import VisZ from "./wmpClasses/Vis";

export type Attributes = {
  [key: string]: string;
};

export default class WindowsMediaPlayer_SkinEngine extends SkinEngine {
  _phase: number = 0;
  _views: View[] = [];

  static canProcess = (filePath: string): boolean => {
    return filePath.endsWith(".wmz") || filePath.endsWith(".zip");
  };

  static identifyByFile = (filePath: string): string => {
    return ".wms";
  };

  static priority: number = 4;

  /**
   * Process
   */
  async parseSkin() {
    console.log("RESOURCE_PHASE #################");
    this._phase = RESOURCE_PHASE;

    let includedXml = await this._uiRoot.getFileAsString(".wms");
    // for(var i = 0; i<12; i++){
    //   console.log(i, includedXml.charCodeAt(i))
    // }
    // includedXml = includedXml.substring(6, includedXml.length)

    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    const parsed = this.parseXmlFragment(
      // utf8Encode(includedXml)
      decodeWideChars(includedXml)
      // decodeUTF16LE(includedXml)
    ) as unknown as XmlElement;

    await this.traverseChildren(parsed);
    // await this._loadBitmaps();
    await this._imageManager.ensureBitmapsLoaded();

    console.log("GROUP_PHASE #################");
    this._phase = GROUP_PHASE;
    await this.traverseChildren(parsed);

    this._setGlobalVar();

    // await
    await Promise.all(
      this._views.map(async (view) => await view.loadJsScripts())
    );

    //debug:
    // for (const bmpId of Object.keys(UI_ROOT.getBitmaps())) {
    //   console.log("bitmap loaded:", bmpId);
    // }
  }

  async newGroup<Type>(
    Type,
    node: XmlElement,
    parent: any
  ): Promise<Awaited<Type>> {
    const group = new Type(this._uiRoot);
    group.setXmlAttributes(node.attributes);
    await this.traverseChildren(node, group);
    this.addToGroup(group, parent);
    return group;
  }

  async traverseChildren(node: XmlElement, parent: any = null) {
    //? NOTE: I am considering to speedup resource loading by Promise.all
    //? But in the same time we need to reduce code complexity
    //? So, we do Promise.all only on resource loading phase.

    if (this._phase == RESOURCE_PHASE) {
      return await Promise.all(
        node.children.map((child) => {
          if (child instanceof XmlElement) {
            // console.log('traverse->', parent.name, child.name)
            // this._scanRes(child);
            return this.traverseChild(child, parent);
          }
        })
      );
    } else {
      for (const child of node.children) {
        if (child instanceof XmlElement) {
          // this._scanRes(child);
          await this.traverseChild(child, parent);
        }
      }
    }
  }

  async traverseChild(node: XmlElement, parent: any) {
    //? it completely replace this super method.
    const tag = node.name.toLowerCase();
    switch (tag) {
      case "theme":
        return this.theme(node, parent);
      case "view":
        return this.view(node, parent);
      case "subview":
        return this.subview(node, parent);
      case "effects":
        return this.visz(node, parent);
      case "button":
      case "mutebutton":
      case "shufflebutton":
      case "repeatbutton":
      case "playbutton":
      case "stopbutton":
      case "pausebutton":
      case "prevbutton":
      case "nextbutton":
        return this.button(node, parent);
      case "buttongroup":
        return this.buttongroup(node, parent);
      case "buttonelement":
      case "playelement":
      case "stopelement":
      case "pauselement":
      case "prevelement":
      case "nextelement":
        return this.buttonelement(node, parent);
      case "slider":
      case "volumeslider":
      case "balanceslider":
        return this.slider(node, parent);
      case "text":
        return this.textz(node, parent);
      case "playlist":
        return this.playlist(node, parent);
      case "player":
        return this.player(node, parent);
      case "video":
        //* UNHANDLED
        return this.group(node, parent);
      case "wrapper":
        // Note: Included files don't have a single root node, so we add a synthetic one.
        // A different XML parser library might make this unnessesary.
        return this.traverseChildren(node, parent);
      default:
        // TODO: This should be the default fall through
        // if (this._uiRoot.getXuiElement(tag)) {
        //   return this.dynamicXuiElement(node, parent);
        // } else if (await this._predefinedXuiNode(tag)) {
        //   return this.dynamicXuiElement(node, parent);
        // }
        console.warn(`Unhandled XML node type: ${node.name}`);
        return;
    }
  }

  /**
   * <view> = <container><layout/></container>
   * @param node
   * @param parent
   */
  async view(node: XmlElement, parent: any) {
    //? view as container
    const container = new View(this._uiRoot);
    container.setXmlAttributes(node.attributes);
    this._uiRoot.addContainers(container);
    this._views.push(container);

    // //? layout
    // const layoutNode = new XmlElement("layout", {
    //   id: node.attribute.id+ "_normal",
    // });
    // layoutNode.children = node.children;
    node.attributes.id = node.attributes.id + "_normal";
    node.attributes.allowzerosize = "1";
    // const container = await this.container(containerEl, null);

    // node.attributes.id = "normal";

    await this.layout(node, container);
    return container;

    //?old
    // const attr = node.attributes;
    // const containerEl = new XmlElement("container", {
    //   id: attr.id || "main",
    // });
    // const container = await this.container(containerEl, null);

    // //? layout
    // node.attributes.id = "normal";
    // // node.attributes.w = node.attributes.width;
    // // node.attributes.h = node.attributes.height;
    // // node.attributes.background = node.attributes.backgroundimage;

    // await this.newGroup(View, node, container);
  }
  // async container(node: XmlElement, parent: any) {
  //   const container = new Container();
  //   container.setXmlAttributes(node.attributes);
  //   this._uiRoot.addContainers(container);
  //   await this.traverseChildren(node, container);
  //   return container;
  // }

  async subview(node: XmlElement, parent: any) {
    await this.newGroup(SubView, node, parent);
    // await this.traverseChildren(node, group);
  }

  async button(node: XmlElement, parent: any) {
    this._parseActionByTag(node);
    return await this.newGui(ButtonZ, node, parent);
  }
  async buttongroup(node: XmlElement, parent: any) {
    return await this.newGroup(ButtonGroup, node, parent);
  }

  async buttonelement(node: XmlElement, parent: any) {
    this._parseActionByTag(node);
    return await this.newGui(ButtonElement, node, parent);
  }
  _parseActionByTag(node: XmlElement) {
    const tag = node.name;
    let action: string;
    if (tag != "buttonelement") {
      if (tag.endsWith("element")) {
        action = tag.substring(0, tag.length - 7);
        node.attributes.action = action;
      } else if (tag.endsWith("button")) {
        action = tag.substring(0, tag.length - 6);
        if (action) {
          //avoid action='' in which may is misleading and drive to conflict
          node.attributes.action = action;
        }
      }
      switch (action) {
        case "play":
          node.attributes.upToolTip = "Play";
          node.attributes.enabled = `wmpenabled:player.controls.${action}`;
          break;
        case "pause":
          node.attributes.upToolTip = "Pause";
          node.attributes.enabled = `wmpenabled:player.controls.${action}`;
          break;
        case "stop":
          node.attributes.upToolTip = "Stop";
          node.attributes.enabled = `wmpenabled:player.controls.${action}`;
          break;
      }
    }
  }

  async slider(node: XmlElement, parent: any) {
    const slider = (await this.newGui(SliderZ, node, parent)) as SliderZ;
    switch (node.name.toLowerCase()) {
      case "volumeslider":
        slider.setXmlAttr("action", "volume");
        break;
      case "balanceslider":
        slider.setXmlAttr("action", "pan");
        break;
    }
  }
  async visz(node: XmlElement, parent: any) {
    return this.newGui(VisZ, node, parent);
  }

  async textz(node: XmlElement, parent: any) {
    return this.newGui(TextZ, node, parent);
  }

  async playlist(node: XmlElement, parent: any) {
    return this.newGui(PlayListGuiZ, node, parent);
  }

  async player(node: XmlElement, parent: any) {
    // return this.newGui(Player, node, parent);
    const theme = this._uiRoot.findContainer("theme") as Theme;
    theme.getPlayer().setXmlAttributes(node.attributes);
  }

  /**
   * WMZ seem as has only one xml; that is it
   * @param node
   * @param parent
   */
  async theme(node: XmlElement, parent: any) {
    if (this._phase == RESOURCE_PHASE) {
      this._uiRoot.setSkinInfo(node.attributes);
      return await this.parseAttributesAsImages(node);
    } else {
      const theme = new Theme(this._uiRoot);
      theme.setXmlAttr("id", "theme");
      this._uiRoot.addContainers(theme);

      await this.traverseChildren(node, parent);
    }
  }

  /**
   * wmp has no <bitmap/>, we load bitmaps here
   * @param theme
   * @returns
   */
  async parseAttributesAsImages(theme: XmlElement) {
    // return;
    const transparentImages = [
      "background",
      "image",
      "thumb",
      "hoverimage",
      "downimage",
      "hoverdownimage",
      "disabledimage",
    ];
    const recursiveScanChildren = (mother: XmlElement) => {
      for (const element of mother.children) {
        if (element instanceof XmlElement) {
          this._lowercaseAttributes(element); // set all xml attribute to lowercase.
          for (const att of [
            "background",
            "image",
            "hoverimage",
            "downimage",
            "hoverdownimage",
            "disabledimage",
            "thumb",
            "mappingimage",
            "clippingimage",
          ]) {
            if (element.attributes[att]) {
              const bitmapId = element.attributes[att];
              const bitmap: Attributes = {
                id: bitmapId,
                file: bitmapId,
              };
              //set transparentColor if any
              if (element.attributes.transparencycolor != null) {
                if (transparentImages.includes(att)) {
                  bitmap.transparentcolor =
                    element.attributes.transparencycolor;
                }
              }
              console.log(
                `scan bitmap. att:'${att}' value:'${JSON.stringify(bitmap)}' @`,
                JSON.stringify(element.attributes)
              );
              // if (att == "background") {
              //   if (element.attributes.transparencycolor != null) {
              //     node.attributes.transparentcolor =
              //       element.attributes.transparencycolor;
              //   }
              // }
              this.bitmap(new XmlElement("bitmap", bitmap));
            }
          }
          //subview sometime only declare transparencyColor without image
          // let children know it
          if (
            element.name == "subview" &&
            element.attributes.transparencycolor
          ) {
            const transparencyColor = element.attributes.transparencycolor;
            for (const subChild of element.children) {
              if (
                subChild instanceof XmlElement &&
                !subChild.attributes.transparencycolor
              ) {
                subChild.attributes.transparencycolor = transparencyColor;
              }
            }
          }
          recursiveScanChildren(element);
        }
      }
    }; //eof function

    recursiveScanChildren(theme);
  }

  _lowercaseAttributes(element: XmlElement) {
    //? lowercase tag
    element.name = element.name.toLowerCase();
    //? lowercase all att
    for (const att of Object.keys(element.attributes)) {
      const lower = att.toLowerCase();
      if (att != lower && lower != "id") {
        element.attributes[lower] = element.attributes[att];
        delete element.attributes[att];
      }
    }
    // // Quicksilver.wmz second view has translated(-18,-26)
    // if(element.name=='subview'){
    //   if(element.attributes.top !=null){
    //     element.attributes.top = `${parseInt(element.attributes.top)-26}`
    //   }
    //   if(element.attributes.left !=null){
    //     element.attributes.left = `${parseInt(element.attributes.left)-18}`
    //   }
    // }
    //? convert WMZ specific attributes to WAL
    const replacement = {
      thumbimage: "thumb",
      direction: "orientation",
      left: "x",
      top: "y",
      width: "w",
      height: "h",
      backgroundimage: "background",
      alphablend: "alpha",
      // passthrough: "ghost",
    };
    const replacable = Object.keys(replacement);
    for (const att of Object.keys(element.attributes)) {
      if (replacable.includes(att)) {
        element.attributes[replacement[att]] = element.attributes[att];
        delete element.attributes[att];
      }
    }

    // console.log('--mini', Object.keys(element.attributes))
    // console.log('--mini', element.attributes)
    //temporary patch to make slider visible:
    // if(element.name=='slider'){
    //   if(element.attributes.orientation=='vertical'){
    //     element.attributes.w='8'
    //     element.attributes.h='64'
    //   } else {
    //     element.attributes.h='6'
    //     element.attributes.w='64'
    //   }
    // }
  }

  parseXmlFragment(xml: string): XmlElement {
    if (!xml.startsWith("<wrapper>")) {
      xml = `<wrapper>${xml}</wrapper>`;
    }
    let result;
    // Note: Included files don't have a single root node, so we add a synthetic one.
    // A different XML parser library might make this unnessesary.
    try {
      // result= parseXml(xml) as unknown as XmlElement;
      result = parseXml2(xml) as unknown as XmlElement;
    } catch (error) {
      console.warn(error);
      console.log("e:", error.message);
      console.log("column:", error.column);
      console.log("exceprt:", error.excerpt);
      console.log("line:", error.line);
      console.log("pos:", error.pos);
      console.log(error.excerpt.substring(error.column, error.column + 100));
      console.log("full:", xml.substring(error.pos, error.pos + 100));
    }
    return result;
  }

  _setGlobalVar() {
    //OpenState: https://docs.microsoft.com/en-us/windows/win32/wmp/player-openstate
    window["osPlaylistChanging"] = 1; //* New playlist is about to be loaded.
    window["osPlaylistLocating"] = 2; //* Windows Media Player is attempting to locate the playlist. The playlist can be local (library or metafile with an .asx file name extension) or remote.
    window["osPlaylistConnecting"] = 3; //* Connecting to the playlist.
    window["osPlaylistLoading"] = 4; //* Playlist has been found and is now being retrieved.
    window["osPlaylistOpening"] = 5; //* Playlist has been retrieved and is now being parsed and loaded.
    window["osPlaylistOpenNoMedia"] = 6; //* Playlist is open.
    window["osPlaylistChanged"] = 7; //* A new playlist has been assigned to currentPlaylist.
    window["osMediaChanging"] = 8; //* A new media item is about to be loaded.
    window["osMediaLocating"] = 9; //* Windows Media Player is locating the media item. The file can be local or remote.
    window["osMediaConnecting"] = 10; //* Connecting to the server that holds the media item.
    window["osMediaLoading"] = 11; //* Media item has been located and is now being retrieved.
    window["osMediaOpening"] = 12; //* Media item has been retrieved and is now being opened.
    window["osMediaOpen"] = 13; //* Media item is now open.
    window["osBeginCodecAcquisition"] = 14; //* Starting codec acquisition.
    window["osEndCodecAcquisition"] = 15; //* Codec acquisition is complete.
    window["osBeginLicenseAcquisition"] = 16; //* Acquiring a license to play DRM protected content.
    window["osEndLicenseAcquisition"] = 17; //* License to play DRM protected content has been acquired.
    window["osBeginIndividualization"] = 18; //* Begin DRM Individualization.
    window["osEndIndividualization"] = 19; //* DRM individualization has been completed.
    window["osMediaWaiting"] = 20; //* Waiting for media item.
    window["osOpeningUnknownURL"] = 21; //* Opening a URL with an unknown type.
  }
}
//
registerSkinEngine(WindowsMediaPlayer_SkinEngine);

//

//Braindead decoder that assumes fully valid input
function decodeUTF16LE(binaryStr) {
  var cp = [];
  for (var i = 0; i < binaryStr.length; i += 2) {
    cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8));
  }

  var result = String.fromCharCode.apply(String, cp);
  console.log("res:", result);
  return result;
}

/**
 * Encodes multi-byte Unicode string into utf-8 multiple single-byte characters
 * (BMP / basic multilingual plane only).
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars.
 *
 * Can be achieved in JavaScript by unescape(encodeURIComponent(str)),
 * but this approach may be useful in other languages.
 *
 * @param   {string} unicodeString - Unicode string to be encoded as UTF-8.
 * @returns {string} UTF8-encoded string.
 */
function utf8Encode(unicodeString) {
  if (typeof unicodeString != "string")
    throw new TypeError("parameter ‘unicodeString’ is not a string");
  const utf8String = unicodeString
    .replace(
      /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | (cc >> 6), 0x80 | (cc & 0x3f));
      }
    )
    .replace(
      /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(
          0xe0 | (cc >> 12),
          0x80 | ((cc >> 6) & 0x3f),
          0x80 | (cc & 0x3f)
        );
      }
    );
  console.log("res:", utf8String);
  return utf8String;
}

class Parser2 extends Parser {
  error(message) {
    if (message.startsWith("Duplicate attribute:")) {
      return; // do not stop on duplicat
    }
    super.error(message);
  }
}

function parseXml2(xml: string, options: any = undefined): XmlDocument {
  return new Parser2(xml, options).document;
}

/**
 * WindowsMediaPlayer may have UTF16LE file content
 * @param binaryStr filecontent
 * @returns utf8 content
 */
export function decodeWideChars(binaryStr: string) {
  if (binaryStr.charCodeAt(0) < 255) {
    return binaryStr;
  }
  var cp = "";
  for (var i = 1; i < binaryStr.length; i += 2) {
    cp += binaryStr[i];
  }
  var result = cp;
  // console.log("res:", result);
  return result;
}
