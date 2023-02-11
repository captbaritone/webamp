import { num } from "../../utils";
import GuiObj from "./GuiObj";
// import { UIRoot } from "../../UIRoot";
import Group from "./Group";
// import { px, toBool, clamp } from "../../utils";
// import Button from "./Button";
// import Layer from "./Layer";


// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3CWasabi:Frame.2F.3E
export default class Frame extends Group {
  static GUID = "e2bbc14d417384f6ebb2b3bd5055662f";
  _position: number = 0;
  _orientation : string = 'h';
  _resizable: boolean = true;   //? Set this flag to allow the user to change the position of the framedivider. 
  _from: string;    //?  the edge. 'l' | 't' | 'r' | 'b'
  _width: number;   //?  How many pixels from the chosen edge to start.
  _height: number;  //?  How many pixels from the chosen edge to start.
  //* don't be confused with _minimumWidth & _maximumWidth !
  _minwidth: number;    //? The minimum amount of pixels you are able to move the poppler if resizable (If you go below this value the poppler will snap to 0).
  _maxwidth: number;    //? The maximum amount of pixels you are able to move the poppler if resizable.
  _leftId: string;
  _rightId: string;
  _topId: string;
  _bottomId: string;

  getElTag(): string {
    return "frame2";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key.toLowerCase()) {
      // case "width": this._width = num(value); break;
      // case "height": this._height = num(value); break;
      case "width": this._position = num(value); break;
      case "height": this._position = num(value); break;
      case "minwidth": this._minwidth = num(value) || 0; break;
      case "maxwidth": this._maxwidth = num(value) || 0; break;

      case "orientation": this._orientation = value.toLowerCase()[0]; break;
      // case "from": this._from = value.toLowerCase()[0]; break;
      case "from": this.setFrom(value.toLowerCase()[0]); break;
      case "left": this._leftId = value.toLowerCase(); break;
      case "right": this._rightId = value.toLowerCase(); break;
      case "top": this._topId = value.toLowerCase(); break;
      case "bottom": this._bottomId = value.toLowerCase(); break;

      default:
        return false;
    }
    return true;
  }

  getposition(): number {
    return this._position
  }
  setposition(position: number) {
    this._position = position;
    // this._width = position;
    // this._height = position;
    this.alignChildren()
  }

  setFrom(from:string){
    //? because maki expect to read 'left' instead 'l'
    const correction = {
      l:'left',
      r:'right',
      b:'bottom',
      t:'top'
    }
    this._from = correction[from];

  }
  init() {
    super.init();
    // this.resolveButtonsAction();
    // this._uiRoot.vm.dispatch(this, "onstartup", []);
  }

  _getEl(directions: string[]): GuiObj[] {
    return [
      this.findobject(this[`_${directions[0]}Id`]),
      this.findobject(this[`_${directions[1]}Id`]),
    ]
  }

  alignChildren(){
    this.getDiv().style.setProperty('--position', `${this._position}`)
    this._width = this._position;
    this._height = this._position;
    console.log('FRAME:'+this._id, this)
    const fullSizes = this._orientation == 'v'? {h:'0', relath:'1'} : {w:'0', relatw: '1'}
    if (this._from == 'left'){
        const [el1,el2] = this._getEl(['left', 'right']);
        el1.setXmlAttributes({
          ...fullSizes,
          w: `${this._width - 4}`,
        })
        el2.setXmlAttributes({
          ...fullSizes,
          x: `${this._width + 4}`,
          w: `-${this._width + 4}`,
          relatw: '1',
        })
    }
    else 
    if (this._from == 'right'){
        const [el1,el2] = this._getEl(['left', 'right']);
        el1.setXmlAttributes({
          ...fullSizes,
          w: `-${this._width + 4}`,
          relatw: '1',
        })
        el2.setXmlAttributes({
          ...fullSizes,
          x: `-${this._width - 4}`,
          relatx: '1',
          w: `${this._width - 8}`,
        })
    }
    else 
    if (this._from == 'bottom'){
        const [el1,el2] = this._getEl(['top', 'bottom']);
        el1.setXmlAttributes({
          ...fullSizes,
          h: `-${this._height + 4}`,
          relath: '1',
        })
        el2.setXmlAttributes({
          ...fullSizes,
          y: `-${this._height - 4}`,
          relaty: '1',
          h: `${this._height - 8}`,
        })
    }
    else {
        console.log('frame not implemented: from=',this._from)
    }
  }
  
  draw() {
    // debugger;
    // this.resolveButtonsAction();
    // if(this._elImage){
    //   this.setXmlAttr('relatw', '0')
    //   const w = this._elImage.getwidth().toString();
    //   this.setXmlAttr('w', w)
    //   this._setButtonWidth(w)
    // }
    super.draw();
    this.alignChildren()
    // if (this._vertical) {
    //   this._div.classList.add("vertical");
    // } else {
    //   this._div.classList.remove("vertical");
    // }
  }
}
