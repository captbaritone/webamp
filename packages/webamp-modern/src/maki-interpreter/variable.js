import Emitter from "../Emitter";

class Variable {
  constructor({ type, typeName, global }) {
    this.type = type;
    this.typeName = typeName;
    this.global = global;
    this._emitter = new Emitter();
    this._unsubscribeFromValue = null;
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    if (this._unsubscribeFromValue != null) {
      this._unsubscribeFromValue();
    }
    if (this.global && this.typeName === "OBJECT" && value !== 0) {
      this._unsubscribeFromValue = value.js_listenToAll(
        (eventName, ...args) => {
          this._emitter.trigger(eventName.toLowerCase(), ...args);
        }
      );
    }
    this._value = value;
  }

  hook(eventName, cb) {
    this._emitter.listen(eventName.toLowerCase(), cb);
  }

  dispose() {
    if (this._unsubscribeFromValue) {
      this._unsubscribeFromValue();
    }
    this._emitter.dispose();
  }

  static newInt(value) {
    const result = new Variable({
      type: "INT",
      typeName: "WHAT",
      global: false,
    });
    result.setValue(value);
    return result;
  }
}

export default Variable;
