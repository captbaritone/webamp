import {
  MakiTree,
  ModernAction,
  ModernStore,
  XmlTree,
  XmlNode,
  Thunk,
} from "./types";
import JSZip from "jszip";
import * as Utils from "./utils";
import initialize from "./initialize";
import initializeStateTree from "./initializeStateTree";
import { run } from "./maki-interpreter/virtualMachine";
import System from "./runtime/System";
import runtime from "./runtime";
import MakiObject from "./runtime/MakiObject";
import JsScript from "./runtime/JsScript";

export function setMakiTree(makiTree: MakiTree): ModernAction {
  return { type: "SET_MAKI_TREE", makiTree };
}

export function setXmlTree(xmlTree: XmlTree): Thunk {
  return async dispatch => {
    dispatch({
      type: "SET_XML_TREE",
      xmlTree: await initializeStateTree(xmlTree),
    });
  };
}

export function gotSkinUrl(skinUrl: string, store: ModernStore): Thunk {
  return async dispatch => {
    const resp = await fetch(skinUrl);
    dispatch(gotSkinBlob(await resp.blob(), store));
  };
}

export function gotSkinBlob(blob: Blob, store: ModernStore): Thunk {
  return async dispatch => {
    dispatch(gotSkinZip(await JSZip.loadAsync(blob), store));
  };
}

async function unloadSkin(makiTree: MakiTree): Promise<void> {
  await Utils.asyncTreeFlatMap(makiTree, async (node: MakiObject) => {
    if (node instanceof JsScript && node.system) {
      node.system.onscriptunloading();
    }

    return node;
  });
}

export function gotSkinZip(zip: JSZip, store: ModernStore): Thunk {
  return async dispatch => {
    // unload current skin if one has been loaded
    if (store.getState().modernSkin.skinLoaded) {
      await unloadSkin(store.getState().modernSkin.makiTree);
      dispatch({ type: "SKIN_UNLOADED" });
    }

    const skinXml = await Utils.readXml(zip, "skin.xml");
    if (skinXml == null) {
      throw new Error("Could not find skin.xml in skin");
    }
    const rawXmlTree = await Utils.inlineIncludes(skinXml, zip);
    const xmlTree = Utils.mapTreeBreadth(
      rawXmlTree,
      (node: XmlNode, parent: XmlNode) => {
        return { ...node, uid: Utils.getId(), parent };
      }
    );

    dispatch(setXmlTree(xmlTree));

    const makiTree = await initialize(zip, xmlTree);
    // Execute scripts
    await Utils.asyncTreeFlatMap(makiTree, async (node: MakiObject) => {
      switch (node.name) {
        case "groupdef": {
          // removes groupdefs from consideration (only run scripts when actually referenced by group)
          return {};
        }
        case "script": {
          // TODO: stop ignoring standardframe
          if (node.attributes.file.endsWith("standardframe.maki")) {
            return node;
          }
          const scriptGroup = Utils.findParentNodeOfType(
            node,
            new Set(["group", "WinampAbstractionLayer", "WasabiXML"])
          );
          node.system = new System(scriptGroup, store);
          const script = await Utils.readUint8array(zip, node.attributes.file);
          run({
            runtime,
            data: script,
            system: node.system,
            log: false,
          });
          return node;
        }
        default: {
          return node;
        }
      }
    });

    dispatch(setMakiTree(makiTree));
  };
}

export function setVolume(volume: number): ModernAction {
  return { type: "SET_VOLUME", volume };
}
