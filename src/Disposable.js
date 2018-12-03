export default class Disposable {
  _teardowns = [];
  add(...teardowns) {
    this._teardowns.push(...teardowns);
  }
  dispose() {
    this._teardowns.forEach(teardown => {
      if (typeof teardown === "function") {
        teardown();
      } else if (typeof teardown.unsubscribe === "function") {
        teardown.unsubscribe();
      } else if (typeof teardown.dispose === "function") {
        teardown.dispose();
      }
    });
  }
}
