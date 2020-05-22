// TODO: Merge with the Webamp emitter
export default class Emitter {
  _hooks: { [eventName: string]: Array<(...args: any[]) => void> };
  _globalHooks: Array<(eventName: string, ...args: any[]) => void>;
  constructor() {
    this._hooks = {};
    // TODO: Rename this property
    this._globalHooks = [];
  }

  listen(eventName: string, cb: (...args: any[]) => void) {
    if (this._hooks[eventName] == null) {
      this._hooks[eventName] = [];
    }
    this._hooks[eventName].push(cb);
    return () => {
      this._hooks[eventName] = this._hooks[eventName].filter(
        (hookCb) => hookCb !== cb
      );
    };
  }

  trigger(eventName: string, ...args: any[]) {
    this._globalHooks.map((cb) => cb(eventName, ...args));
    if (this._hooks[eventName] == null) {
      return;
    }
    this._hooks[eventName].map((cb) => cb(...args));
  }

  listenToAll(cb: (eventName: string, ...args: any[]) => void) {
    this._globalHooks.push(cb);
    return () => {
      this._globalHooks = this._globalHooks.filter((hookCb) => hookCb !== cb);
    };
  }

  dispose() {
    // Note: This will cause any future trigger or hook to cause a runtime error.
    this._hooks = {};
    this._globalHooks = [];
  }
}
