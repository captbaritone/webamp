import { unimplementedWarning } from "../utils";
import Layer from "./Layer";

class AlbumArtLayer extends Layer {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "AlbumArtLayer";
  }

  refresh() {
    unimplementedWarning("refresh");
    return;
  }

  isloading() {
    unimplementedWarning("isloading");
    return;
  }

  onalbumartloaded(success: boolean) {
    unimplementedWarning("onalbumartloaded");
    return;
  }
}

export default AlbumArtLayer;
