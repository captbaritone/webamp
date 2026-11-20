import { bindHotkeys } from "./hotkeys";

function pressR(target: EventTarget) {
  // R toggles repeat.
  target.dispatchEvent(
    new KeyboardEvent("keydown", { keyCode: 82, bubbles: true })
  );
}

describe("bindHotkeys", () => {
  let webampNode: HTMLElement;
  let button: HTMLElement;
  let outside: HTMLElement;

  beforeEach(() => {
    webampNode = document.createElement("div");
    button = document.createElement("button");
    webampNode.appendChild(button);
    outside = document.createElement("button");
    document.body.append(webampNode, outside);
  });

  afterEach(() => {
    webampNode.remove();
    outside.remove();
  });

  it("handles hotkeys anywhere in the document by default", () => {
    const dispatch = vi.fn();
    const unbind = bindHotkeys(dispatch);
    pressR(outside);
    pressR(button);
    unbind();
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith({ type: "TOGGLE_REPEAT" });
  });

  it("only handles hotkeys within the target when given one", () => {
    const dispatch = vi.fn();
    const unbind = bindHotkeys(dispatch, webampNode);
    pressR(outside);
    expect(dispatch).not.toHaveBeenCalled();
    pressR(button);
    expect(dispatch).toHaveBeenCalledWith({ type: "TOGGLE_REPEAT" });
    unbind();
  });

  it("stops handling hotkeys once unbound", () => {
    const dispatch = vi.fn();
    bindHotkeys(dispatch, webampNode)();
    pressR(button);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
