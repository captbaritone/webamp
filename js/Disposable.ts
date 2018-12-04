type Teardown = (() => void) | { dispose: () => void };

export default class Disposable {
  _teardowns: Teardown[] = [];

  add(...teardowns: Teardown[]): void {
    this._teardowns.push(...teardowns);
  }

  dispose() {
    this._teardowns.forEach(teardown => {
      if (typeof teardown === "function") {
        teardown();
      } else if (typeof teardown.dispose === "function") {
        teardown.dispose();
      }
    });
  }
}
