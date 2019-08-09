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
    if (this.global && this.typeName === "OBJECT" && value !== null) {
      this._unsubscribeFromValue = value.js_listenToAll(
        (eventName, ...args) => {
          this._emitter.trigger(eventName, ...args);
        }
      );
    }
    this._value = value;
  }

  hook(eventName, cb) {
    this._emitter.listen(eventName, cb);
  }

  dispose() {
    if (this._unsubscribeFromValue) {
      this._unsubscribeFromValue();
    }
    this._emitter.dispose();
  }
}

export default Variable;
