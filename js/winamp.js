// UI and App logic
import Media from "./media";
import {
  setSkinFromUrl,
  setVolume,
  setPreamp,
  setBalance,
  loadMediaFromUrl,
  loadFileFromReference
} from "./actionCreators";
import "../css/winamp.css";

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.style.display = "none";

export default {
  media: new Media(fileInput),
  fileInput: fileInput,
  init: function(options) {
    this.fileInput.addEventListener("change", e => {
      this.dispatch(loadFileFromReference(e.target.files[0]));
    });

    this.dispatch(setVolume(options.volume));
    this.dispatch(setBalance(options.balance));
    this.dispatch(setPreamp(50));
    if (options.mediaFile.url !== null) {
      this.dispatch(
        loadMediaFromUrl(options.mediaFile.url, options.mediaFile.name)
      );
    }
    this.dispatch(setSkinFromUrl(options.skinUrl));
    return this;
  }
};
