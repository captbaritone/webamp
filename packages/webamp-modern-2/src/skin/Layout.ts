import Group from "./Group";
import * as Utils from "../utils";
import Container from "./Container";
import Layer from "./Layer";

export default class Layout extends Group {
  _parent: Container | null = null;
  // TODO: I don't think Layers are actually children of Layouts
  _layers: Layer[] = [];

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "desktopalpha":
        this._desktopAlpha = Utils.toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  setParent(container: Container) {
    this._parent = container;
  }

  // TODO: I don't think this is right.
  addLayer(layer: Layer) {
    this._layers.push(layer);
  }

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();
    for (const layer of this._layers) {
      div.appendChild(layer.getDebugDom());
    }
    return div;
  }
}
