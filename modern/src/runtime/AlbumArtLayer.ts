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

  refresh(): void {
    return unimplementedWarning("refresh");
  }

  isloading(): void {
    return unimplementedWarning("isloading");
  }

  onalbumartloaded(success: boolean): void {
    return unimplementedWarning("onalbumartloaded");
  }
}

export default AlbumArtLayer;
