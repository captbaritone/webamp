import Emitter from "../emitter";
import createStore from "../store";
import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";

// Actually tests action creators too
const media = {
  addEventListener: jest.fn(),
  setVolume: jest.fn(),
  setBalance: jest.fn(),
  setPreamp: jest.fn(),
  getAnalyser: () => null,
  on: jest.fn()
};

const store = createStore(media, new Emitter());

test("handles history correctly", () => {
  const mockPreset = [
    { type: "RESOLVED", name: "First", preset: {} },
    { type: "RESOLVED", name: "Second", preset: {} }
  ];
  store.dispatch(Actions.toggleRandomizePresets());
  // Check initial state
  expect(store.getState().milkdrop.presetHistory).toEqual([]);
  expect(Selectors.getCurrentPreset(store.getState())).toBe(null);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(null);

  // Load some presets
  store.dispatch(Actions.loadPresets(mockPreset));
  expect(store.getState().milkdrop.presetHistory).toEqual([0]);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(0);

  // Select next
  store.dispatch(Actions.selectNextPreset());
  expect(store.getState().milkdrop.presetHistory).toEqual([0, 1]);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(1);

  // Select previous
  store.dispatch(Actions.selectPreviousPreset());
  expect(store.getState().milkdrop.presetHistory).toEqual([0]);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(0);

  // Next again
  store.dispatch(Actions.selectNextPreset());
  expect(store.getState().milkdrop.presetHistory).toEqual([0, 1]);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(1);

  // Previous again
  store.dispatch(Actions.selectPreviousPreset());
  expect(store.getState().milkdrop.presetHistory).toEqual([0]);
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(0);
});
