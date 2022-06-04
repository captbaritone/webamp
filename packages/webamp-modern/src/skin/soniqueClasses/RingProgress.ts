import GuiObj from "../makiClasses/GuiObj";

export default class RingProgress extends GuiObj {
  _rgnId: string;
  _action: string;
  _colors: string[] = [];
  _bgColor: string;
  _bgImageId: string;
  _progress: number = 0.7; //temporary


  getElTag(): string {
    return "layer";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key) {
      case "region":
        this._rgnId = value;
        break;
      case "background":
        this._bgImageId = value;
        break;
      case "colors":
        this._buildColors(value);
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
      if (!color.startsWith("0x")) {
        throw new Error("color is expected in 0xFF999999 format.");
      }
      if (color.length == 10) {
        color = color.substring(4);
      } else {
        color = color.substring(2);
      }
      this._colors.push(`#${color}`);
    }
  }

  draw(): void {
    super.draw();
    this.getDiv().style.backgroundImage = `conic-gradient(${this._colors.join(
      ", "
    )})`;
  }
}
