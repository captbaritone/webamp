import Disposable from "./Disposable";

describe("Disposable", () => {
  it("runs its teardowns, and disposable teardowns, once", () => {
    const disposable = new Disposable();
    const teardown = vi.fn();
    const inner = { dispose: vi.fn() };
    disposable.add(teardown, inner);
    disposable.dispose();
    disposable.dispose();
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(inner.dispose).toHaveBeenCalledTimes(1);
  });

  it("refuses teardowns once disposed", () => {
    const disposable = new Disposable();
    disposable.dispose();
    expect(() => disposable.add(() => {})).toThrow(
      "Attempted to add a new teardown to a disposed disposable."
    );
    expect(() => disposable.child()).toThrow();
  });

  describe("child", () => {
    it("is disposed with its parent", () => {
      const parent = new Disposable();
      const teardown = vi.fn();
      parent.child().add(teardown);
      parent.dispose();
      expect(teardown).toHaveBeenCalledTimes(1);
    });

    it("leaves its parent when disposed on its own", () => {
      const parent = new Disposable();
      const teardown = vi.fn();
      const child = parent.child();
      child.add(teardown);
      expect(parent._teardowns.size).toBe(1);

      child.dispose();
      expect(teardown).toHaveBeenCalledTimes(1);
      expect(parent._teardowns.size).toBe(0);

      parent.dispose();
      expect(teardown).toHaveBeenCalledTimes(1);
    });

    it("doesn't affect its siblings when disposed", () => {
      const parent = new Disposable();
      const sibling = vi.fn();
      parent.child().add(sibling);
      parent.child().dispose();
      expect(sibling).not.toHaveBeenCalled();
      parent.dispose();
      expect(sibling).toHaveBeenCalledTimes(1);
    });

    it("disposes nested children", () => {
      const root = new Disposable();
      const teardown = vi.fn();
      root.child().child().add(teardown);
      root.dispose();
      expect(teardown).toHaveBeenCalledTimes(1);
    });
  });
});
