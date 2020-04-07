type Teardown = (() => void) | { dispose: () => void };

export default class Disposable {
  _teardowns: Teardown[] = [];
  disposed: boolean;

  constructor() {
    this.disposed = false;
  }

  add(...teardowns: Teardown[]): void {
    if (this.disposed) {
      throw new Error(
        "Attempted to add a new teardown to a disposed disposable."
      );
    }
    this._teardowns.push(...teardowns);
  }

  dispose() {
    if (this.disposed) {
      throw new Error(
        "Attempted to dispose disposable which is already disposed."
      );
    }
    this._teardowns.forEach((teardown) => {
      if (typeof teardown === "function") {
        teardown();
      } else if (typeof teardown.dispose === "function") {
        teardown.dispose();
      }
    });
    this._teardowns = [];
    this.disposed = true;
  }
}
