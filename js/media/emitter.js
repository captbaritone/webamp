export default class Emitter {
  constructor() {
    this._listeners = {};
  }

  on(event, callback) {
    const eventListeners = this._listeners[event] || [];
    eventListeners.push(callback);
    this._listeners[event] = eventListeners;
    const unsubscribe = () => {
      this._listeners[event] = eventListeners.filter(cb => cb !== callback);
    };
    return unsubscribe;
  }

  trigger(event) {
    const callbacks = this._listeners[event];
    if (callbacks) {
      callbacks.forEach(cb => cb());
    }
  }
}
