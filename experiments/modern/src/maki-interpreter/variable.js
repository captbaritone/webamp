const Emitter = require("../Emitter");

class Variable {
  constructor({ type, typeName }) {
    this.type = type;
    this.typeName = typeName;
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
    if (this.typeName === "OBJECT") {
      this._unsubscribeFromValue = value.js_listenToAll(
        async (eventName, args) => {
          // Remove this await when we can run the VM synchronously.
          // See GitHub issue #814
          await this._emitter.trigger(eventName, args);
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

module.exports = Variable;
