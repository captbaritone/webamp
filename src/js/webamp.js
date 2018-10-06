import JSZip from "jszip";
import jsmediatags from "jsmediatags";
import WebampLazy from "./webampLazy";

class Winamp extends WebampLazy {
  constructor(options) {
    super({
      ...options,
      requireJSZip: () => JSZip,
      requireJSMediaTags: () => jsmediatags
    });
  }
}

export default Winamp;
