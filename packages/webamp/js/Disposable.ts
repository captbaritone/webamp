type Teardown = (() => void) | { dispose: () => void };

export default class Disposable {
  _teardowns: Set<Teardown> = new Set();
  _parent: Disposable | null = null;
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
    for (const teardown of teardowns) {
      this._teardowns.add(teardown);
    }
  }

  /**
   * A disposable for something that may end before this one does. It's
   * disposed along with this one, or can be disposed on its own, which also
   * removes it from this one, so neither it nor anything its teardowns close
   * over is kept until this one is disposed.
   *
   * A child has exactly one parent: the disposable that created it.
   */
  child(): Disposable {
    const child = new Disposable();
    this.add(child);
    child._parent = this;
    return child;
  }

  // Disposing more than once is a no-op, since a child may be disposed both on
  // its own and by its parent.
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    const teardowns = this._teardowns;
    this._teardowns = new Set();
    this._parent?._teardowns.delete(this);
    this._parent = null;
    teardowns.forEach((teardown) => {
      if (typeof teardown === "function") {
        teardown();
      } else if (typeof teardown.dispose === "function") {
        teardown.dispose();
      }
    });
  }
}
