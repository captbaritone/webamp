class GuiObject {}
class Group extends GuiObject {}
class PopupMenu {}
class Container {}

const System = {
  getScriptGroup() {
    return new Group();
  },
  getToken(str, separator, tokennum) {
    return "Some Token String";
  },
  getParam() {
    return "Some String";
  }
};

const environment = {
  System,
  Group,
  GuiObject,
  PopupMenu,
  Container
};

class Variable {
  constructor(props) {
    this._props = props;
    this.type = props.type;
    if (props.system) {
      if (this.type.name != "System") {
        throw new Error("Can variables other than System be system variables?");
      }
      this._value = System;
    }
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = value;
  }
}

module.exports = Variable;
