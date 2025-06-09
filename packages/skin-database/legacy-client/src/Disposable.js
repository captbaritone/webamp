export default class Disposable {
  _teardowns = [];
  disposed = false;
  add(...teardowns) {
    this._teardowns.push(...teardowns);
  }
  dispose() {
    if (this.disposed) {
      throw new Error(
        "Cannot dispose an observable that has already been dispsoed"
      );
    }
    this._teardowns.forEach((teardown) => {
      if (typeof teardown === "function") {
        teardown();
      } else if (typeof teardown.unsubscribe === "function") {
        teardown.unsubscribe();
      } else if (typeof teardown.dispose === "function") {
        teardown.dispose();
      }
    });
    this._teardowns = null;
    this.disposed = true;
  }
}
