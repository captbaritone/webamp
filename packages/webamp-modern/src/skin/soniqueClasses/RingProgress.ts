import { num } from "../../utils";
import GuiObj from "../makiClasses/GuiObj";

export default class RingProgress extends GuiObj {
  _rgnId: string;
  _action: string;
  _colors: string[] = [];
  _maxDegree: number = 360; // 0..360
  _bgColor: string = "red";
  _bgImageId: string;
  _maskId: string;
  _staticGradient: string; // css for never changed gradient
  _progress: number = .7; //temporary

  getElTag(): string {
    return "layer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      //   case "region":
      //     this._rgnId = value;
      //     break;
      //   case "background":
      //     this._bgImageId = value;
      //     break;
      case "degree":
        this._maxDegree = num(value);
        break;
      case "mask":
        this._maskId = value;
        break;
      case "colors":
        this._buildColors(value);
        break;
      case "bgcolor":
        this._bgColor = parseColor(value);
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   *
   * @param colors separated comma sonique color
   * * Note: RGB = 0xRRGGBB
   * *       ARGB = 0XFFRRGGBB
   */
  _buildColors(colors: string) {
    for (var color of colors.split(",")) {
      // if (!color.startsWith("0x")) {
      //   throw new Error("color is expected in 0xFF999999 format.");
      // }
      // if (color.length == 10) {
      //   color = color.substring(4);
      // } else {
      //   color = color.substring(2);
      // }
      // this._colors.push(`#${color}`);
      this._colors.push(parseColor(color));
    }
  }

  /**
   * User click on ring
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onLeftButtonDown(x: number, y: number) {
    this.getparentlayout().bringtofront();
    x -= this.getleft();
    y -= this.gettop();
    const bound = this.getDiv().getBoundingClientRect();
    const cx = bound.width / 2;
    const cy = bound.height / 2;
    const deltaX = x - cx;
    const deltaY = y - cy;
    // const rad = Math.atan2(deltaY, deltaX); // In radians
    const rad = Math.atan2(deltaY, deltaX); // In radians
    const pi = Math.PI;
    let deg = rad * (180 / pi); // got: 0..180,-179..-1
    deg = (deg + 450) % 360; // modulus. got: 0..~360
    // if(deg>=0){
    //   deg += 90;
    // } else {
    //   //?negative
    //   if(deg>=-90){
    //     deg += 90
    //   } else {
    //     //? -179..-91 == 270..259
    //   }
    // }
    // console.log("deg:", deg, "=#", deg + 90);
    this._progress = deg / this._maxDegree;
    this.drawProgress()
  }

  drawMask() {
    if (!this._maskId) return;
    const bitmap = this._uiRoot.getBitmap(this._maskId);
    bitmap._setAsBackground(this.getDiv(), "mask");
    // bitmap.setAsBackground(this.getDiv());
    // this.getDiv().classList.add('webamp--img')
    this.getDiv().style.setProperty(
      "-webkit-mask-image",
      `var(${bitmap.getCSSVar()})`
    );
    this.getDiv().style.setProperty(
      "webkit-mask-image",
      `var(${bitmap.getCSSVar()})`
    );
  }

  prepareGradient() {
    // const fullColors = this._colors.map(
    //   (color, i, arr) => `${color} ${((i + 1) * this._degree) / arr.length}deg`
    //   );
    const fullColors = [...this._colors]; //clone
    if (this._maxDegree < 360) {
      let lastColor = fullColors.pop();
      lastColor = `${lastColor} ${this._maxDegree}deg`
      fullColors.push(lastColor)
      // fullColors.push(
      //   `${this._colors[this._colors.length - 1]} ${this._degree}deg`
      // );
      fullColors.push(`transparent ${this._maxDegree}deg`);
    }
    this._staticGradient = `conic-gradient(${fullColors.join(", ")})`;
    // this.getDiv().style.backgroundImage = "";
  }
  
  drawProgress() {
    const progressColors = [
      `transparent ${this._progress * this._maxDegree}deg`,
      `${this._bgColor} ${this._progress * this._maxDegree}deg ${this._maxDegree}deg`,
      `transparent ${this._maxDegree}deg`
    ];
    const dynamicGradient = `conic-gradient(${progressColors.join(", ")})`;

    this.getDiv().style.backgroundImage = `${dynamicGradient}, ${this._staticGradient}`;
  }

  draw(): void {
    super.draw();
    this.prepareGradient();
    this.drawMask();
    this.drawProgress();
  }
}

function parseColor(soniqueColor:string):string {
  let color = soniqueColor
  if (!color.startsWith("0x")) {
    throw new Error("color is expected in 0xFF999999 format.");
  }
  if (color.length == 10) {
    color = color.substring(4);
  } else {
    color = color.substring(2);
  }
  return`#${color}`;
}