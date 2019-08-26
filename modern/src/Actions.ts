import {
  MakiTree,
  ModernAction,
  ModernStore,
  XmlTree,
  ResolvedXmlNode,
  XmlNode,
} from "./types";
import JSZip from "jszip";
import * as Utils from "./utils";
import initialize from "./initialize";
import initializeStateTree from "./initializeStateTree";
import { run } from "./maki-interpreter/virtualMachine";
import System from "./runtime/System";
import runtime from "./runtime";

export function setMakiTree(makiTree: MakiTree): ModernAction {
  return { type: "SET_MAKI_TREE", makiTree };
}

export function setXmlTree(xmlTree: XmlTree) {
  return async dispatch => {
    dispatch({
      type: "SET_XML_TREE",
      xmlTree: await initializeStateTree(xmlTree),
    });
  };
}

export function gotSkinUrl(skinUrl: string, store: ModernStore) {
  return async dispatch => {
    const resp = await fetch(skinUrl);
    dispatch(gotSkinBlob(await resp.blob(), store));
  };
}

export function gotSkinBlob(blob: Blob, store: ModernStore) {
  return async dispatch => {
    dispatch(gotSkinZip(await JSZip.loadAsync(blob), store));
  };
}

export function gotSkinZip(zip: JSZip, store: ModernStore) {
  return async dispatch => {
    const rawXmlTree = await Utils.inlineIncludes(
      await Utils.readXml(zip, "skin.xml"),
      zip
    );
    const xmlTree: ResolvedXmlNode = Utils.mapTree(
      rawXmlTree,
      (node: XmlNode): ResolvedXmlNode => {
        return { ...node, uid: Utils.getId() };
      }
    );

    dispatch(setXmlTree(xmlTree));

    const makiTree = await initialize(zip, xmlTree, store);
    // Execute scripts
    await Utils.asyncTreeFlatMap(makiTree, node => {
      switch (node.name) {
        case "groupdef": {
          // removes groupdefs from consideration (only run scripts when actually referenced by group)
          return {};
        }
        case "script": {
          // TODO: stop ignoring standardframe
          if (node.attributes.file.endsWith("standardframe.maki")) {
            break;
          }
          const scriptGroup = Utils.findParentNodeOfType(
            node,
            new Set(["group", "WinampAbstractionLayer", "WasabiXML"])
          );
          const system = new System(scriptGroup, store);
          run({
            runtime,
            data: node.js_annotations.script,
            system,
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

export function setVolume(volume: number) {
  return { type: "SET_VOLUME", volume };
}
