class Emitter {
  constructor() {
    this._hooks = {};
    // TODO: Rename this property
    this._globalHooks = [];
  }

  listen(eventName, cb) {
    if (this._hooks[eventName] == null) {
      this._hooks[eventName] = [];
    }
    this._hooks[eventName].push(cb);
    return () => {
      this._hooks[eventName] = this._hooks[eventName].filter(
        hookCb => hookCb !== cb
      );
    };
  }

  trigger(eventName, ...args) {
    this._globalHooks.forEach(cb => cb(eventName, args));
    if (this._hooks[eventName] == null) {
      return;
    }
    this._hooks[eventName].forEach(cb => {
      cb(...args);
    });
  }

  listenToAll(cb) {
    this._globalHooks.push(cb);
    return () => {
      this._globalHooks = this._globalHooks.filter(hookCb => hookCb !== cb);
    };
  }

  dispose() {
    // Note: This will cause any future trigger or hook to cause a runtime error.
    this._hooks = null;
    this._globalHooks = null;
  }
}

module.exports = Emitter;
