export default class Emitter {
  _listeners: { [event: string]: Array<(...args: any[]) => void> };

  constructor() {
    this._listeners = {};
  }

  on(event: string, callback: (...args: any[]) => void) {
    const eventListeners = this._listeners[event] || [];
    eventListeners.push(callback);
    this._listeners[event] = eventListeners;
    const unsubscribe = () => {
      this._listeners[event] = eventListeners.filter((cb) => cb !== callback);
    };
    return unsubscribe;
  }

  trigger(event: string, ...args: any[]) {
    const callbacks = this._listeners[event];
    if (callbacks) {
      callbacks.forEach((cb) => cb(...args));
    }
  }

  dispose() {
    this._listeners = {};
  }
}
