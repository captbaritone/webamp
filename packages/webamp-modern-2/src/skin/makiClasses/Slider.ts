import UI_ROOT from "../../UIRoot";
import { assume, clamp, num, px } from "../../utils";
import GuiObj from "./GuiObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cslider.2F.3E_.26_.3CWasabi:HSlider.2F.3E_.26_.3CWasabi:VSlider.2F.3E
export default class Slider extends GuiObj {
  static GUID = "62b65e3f408d375e8176ea8d771bb94a";
  _barLeft: string;
  _barMiddle: string;
  _barRight: string;
  _vertical: boolean = false;
  _thumb: string;
  _downThumb: string;
  _hoverThumb: string;
  _action: string | null = null;
  _low: number;
  _high: number;
  _position: number = 0;
  _thumbDiv: HTMLDivElement = document.createElement("div");

  constructor() {
    super();
    this._thumbDiv.addEventListener("mousedown", (downEvent: MouseEvent) => {
      const rect = this._div.getBoundingClientRect();
      const startX = rect.x;
      const startY = rect.y;
      const width = this.getwidth();
      const height = this.getheight();

      const handleMove = (moveEvent: MouseEvent) => {
        const newMouseX = moveEvent.clientX;
        const newMouseY = moveEvent.clientY;
        const deltaX = newMouseX - startX;
        const deltaY = newMouseY - startY;

        // TODO: What about vertical sliders?
        if (this._vertical) {
          const yPos = clamp(deltaY, 0, height);
          this._position = yPos / height;
        } else {
          const xPos = clamp(deltaX, 0, width);
          this._position = xPos / width;
        }
        this._renderThumbPosition();
        this.onsetposition(this.getposition());
      };

      const handleMouseUp = () => {
        UI_ROOT.vm.dispatch(this, "onsetfinalposition", [
          { type: "INT", value: this.getposition() },
        ]);
        UI_ROOT.vm.dispatch(this, "onpostedposition", [
          { type: "INT", value: this.getposition() },
        ]);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
    });
  }
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
        const lower = value.toLowerCase();
        this._vertical = lower === "v" || lower === "vertical";
        break;
      case "low":
        // (int) Set the low-value boundary. Default is 0.
        this._low = num(value);
        break;
      case "high":
        // (int) Set the high-value boundary. Default is 255.
        this._high = num(value);
        break;
      case "action":
        // Undocumented on the Wiki
        this._action = value;
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
    UI_ROOT.vm.dispatch(this, "onsetposition", [
      { type: "INT", value: newPos },
    ]);
    if (this._action) {
      UI_ROOT.dispatch(this._action, this.getposition(), null);
    }
  }

  _renderThumb() {
    this._thumbDiv.style.position = "absolute";
    this._thumbDiv.setAttribute("data-obj-name", "Slider::Handle");
    this._thumbDiv.classList.add("webamp--img");
    if (this._thumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._thumb);
      this._thumbDiv.style.width = px(bitmap.getWidth());
      this._thumbDiv.style.height = px(bitmap.getHeight());
      bitmap.setAsBackground(this._thumbDiv);
    }

    if (this._downThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._downThumb);
      bitmap.setAsActiveBackground(this._thumbDiv);
    }

    if (this._hoverThumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._hoverThumb);
      bitmap.setAsHoverBackground(this._thumbDiv);
    }
  }

  _renderThumbPosition() {
    if (this._thumb != null) {
      const bitmap = UI_ROOT.getBitmap(this._thumb);
      // TODO: What if the orientation has changed?
      if (this._vertical) {
        const top =
          this._position * (this.getheight() - bitmap.getHeight() / 2);
        this._thumbDiv.style.top = px(top);
      } else {
        const left = this._position * (this.getwidth() - bitmap.getWidth() / 2);
        this._thumbDiv.style.left = px(left);
      }
    }
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
  }

  /*
  extern Slider.onPostedPosition(int newpos);
  extern Slider.onSetFinalPosition(int pos);
  extern Slider.setPosition(int pos);
  extern Slider.lock(); // locks descendant core collbacks
  extern Slider.unlock(); // unloads the
  */
}
