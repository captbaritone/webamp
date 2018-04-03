import Emitter from "./emitter";

describe("Emitter", () => {
  it("calls a callback", () => {
    const mock = jest.fn();
    const emitter = new Emitter();
    emitter.on("some-event", mock);
    emitter.trigger("some-event");
    expect(mock).toHaveBeenCalled();
  });
  it("calls multiple callbacks", () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();
    const emitter = new Emitter();
    emitter.on("some-event", mock1);
    emitter.on("some-event", mock2);
    emitter.trigger("some-event");
    expect(mock1).toHaveBeenCalled();
    expect(mock2).toHaveBeenCalled();
  });
  it("returns an unsubscribe function", () => {
    const mock = jest.fn();
    const emitter = new Emitter();
    const unsubscribe = emitter.on("some-event", mock);
    emitter.trigger("some-event");
    unsubscribe();
    emitter.trigger("some-event");
    emitter.trigger("some-event");
    emitter.trigger("some-event");
    emitter.trigger("some-event");
    emitter.trigger("some-event");
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it("subscriptions do not take effent until the next event", () => {
    const mock = jest.fn();
    const emitter = new Emitter();
    emitter.on("some-event", () => {
      emitter.on("some-event", mock);
    });
    emitter.trigger("some-event");
    expect(mock).not.toHaveBeenCalled();
  });
  it("unsubscribe does not take effect until the next event", () => {
    const mock = jest.fn();
    const emitter = new Emitter();
    emitter.on("some-event", () => {
      unsubscribe(); // eslint-disable-line no-use-before-define
    });
    const unsubscribe = emitter.on("some-event", mock);
    emitter.trigger("some-event");
    expect(mock).toHaveBeenCalled();
  });
});
