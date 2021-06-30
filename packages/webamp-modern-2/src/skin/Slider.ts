import UI_ROOT from "../UIRoot";
import { assume, clamp, num, px } from "../utils";
import GuiObj from "./GuiObj";
import { VM } from "./VM";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cslider.2F.3E_.26_.3CWasabi:HSlider.2F.3E_.26_.3CWasabi:VSlider.2F.3E
export default class Slider extends GuiObj {
  _barLeft: string;
  _barMiddle: string;
  _barRight: string;
  _orientation: string;
  _thumb: string;
  _downThumb: string;
  _hoverThumb: string;
  _low: number;
  _high: number;
  _position: number = 0;
  _thumbDiv: HTMLDivElement = document.createElement("div");
  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "thumb":
        // (id) The bitmap element for the slider thumb.
        this._thumb = value;
        break;
      case "downthumb":
        // (id) The bitmap element for the slider thumb when held by the user.
        this._downThumb = value;
        break;
      case "hoverthumb":
        // (id) The bitmap element for the slider thumb when the user's mouse is above it.
        this._hoverThumb = value;
        break;
      case "barmiddle":
        // (id) The bitmap element for the middle, stretched, position of the slider.
        this._barMiddle = value;
        break;
      case "barleft":
        // (id) The bitmap element for the left or top position of the slider.
        this._barLeft = value;
        break;
      case "barright":
        // (id) The bitmap element for the right or bottom position of the slider.
        this._barRight = value;
        break;
      case "orientation":
        // (str) Either "v" or "vertical" to make the slider vertical, otherwise it will be horizontal.
        this._orientation = value;
        break;
      case "low":
        // (int) Set the low-value boundary. Default is 0.
        this._low = num(value);
        break;
      case "high":
        // (int) Set the high-value boundary. Default is 255.
        this._high = num(value);
        break;
      default:
        return false;
    }
    return true;
  }

  // extern Int Slider.getPosition();
  getposition(): number {
    return this._position * 255;
  }

  onsetposition(newPos: number) {
    VM.dispatch(this, "onsetposition", [{ type: "INT", value: newPos }]);
  }

  _renderThumb() {
    this._thumbDiv.style.position = "absolute";
    this._thumbDiv.setAttribute("data-obj-name", "Slider::Handle");
    this._thumbDiv.classList.add("webamp--guiobj");
    if (this._thumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._thumb);
      this._thumbDiv.style.width = px(bitmap.getWidth());
      this._thumbDiv.style.height = px(bitmap.getHeight());
      this._thumbDiv.style.setProperty(
        "--background-image",
        bitmap.getBackgrondImageCSSAttribute()
      );
      this._thumbDiv.style.setProperty(
        "--background-position",
        bitmap.getBackgrondPositionCSSAttribute()
      );
    }

    if (this._downThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._downThumb);
      this._thumbDiv.style.setProperty(
        "--active-background-image",
        bitmap.getBackgrondImageCSSAttribute()
      );
      this._thumbDiv.style.setProperty(
        "--active-background-position",
        bitmap.getBackgrondPositionCSSAttribute()
      );
    }

    if (this._hoverThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._hoverThumb);
      this._thumbDiv.style.setProperty(
        "--hover-background-image",
        bitmap.getBackgrondImageCSSAttribute()
      );
      this._thumbDiv.style.setProperty(
        "--hover-background-position",
        bitmap.getBackgrondPositionCSSAttribute()
      );
    }
  }

  _renderThumbPosition() {
    if (this._thumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._thumb);
      const left = this._position * (this.getwidth() - bitmap.getWidth() / 2);
      this._thumbDiv.style.left = px(left);
    }
  }

  _renderBindings() {
    this._thumbDiv.addEventListener("mousedown", (downEvent: MouseEvent) => {
      const rect = this._div.getBoundingClientRect();
      const startX = rect.x;
      const startY = rect.y;
      const width = this.getwidth();

      const handleMove = (moveEvent: MouseEvent) => {
        const newMouseX = moveEvent.clientX;
        const newMouseY = moveEvent.clientY;
        const deltaX = newMouseX - startX;
        const deltaY = newMouseY - startY;

        // TODO: What about vertical sliders?
        const xPos = clamp(deltaX, 0, width);
        this._position = xPos / width;
        this._renderThumbPosition();
        this.onsetposition(this.getposition());
      };

      const handleMouseUp = () => {
        VM.dispatch(this, "onsetfinalposition", [
          { type: "INT", value: this.getposition() },
        ]);
        VM.dispatch(this, "onpostedposition", [
          { type: "INT", value: this.getposition() },
        ]);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
    });
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Slider");
    assume(this._barLeft == null, "Need to handle Slider barleft");
    assume(this._barRight == null, "Need to handle Slider barright");
    assume(this._barMiddle == null, "Need to handle Slider barmiddle");
    this._renderThumb();
    this._renderThumbPosition();
    this._div.appendChild(this._thumbDiv);
    this._renderBindings();
  }

  /*
  extern Slider.onPostedPosition(int newpos);
  extern Slider.onSetFinalPosition(int pos);
  extern Slider.setPosition(int pos);
  extern Slider.lock(); // locks descendant core collbacks
  extern Slider.unlock(); // unloads the
  */
}
