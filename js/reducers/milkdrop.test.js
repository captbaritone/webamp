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
  on: jest.fn(),
};

test("The first tack is picked at random", () => {
  const store = createStore(media, new Emitter());
  const mockPreset = [
    { type: "RESOLVED", name: "First", preset: {} },
    { type: "RESOLVED", name: "Second", preset: {} },
    { type: "RESOLVED", name: "Third", preset: {} },
    { type: "RESOLVED", name: "Fourth", preset: {} },
  ];
  Math.random = () => 0.5;
  // Just confirm that the default setting is correct
  expect(Selectors.getRandomizePresets(store.getState())).toBe(true);
  store.dispatch(Actions.loadPresets(mockPreset));
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(2);
});

test("handles history (prev/next) correctly", () => {
  const store = createStore(media, new Emitter());
  const mockPreset = [
    { type: "RESOLVED", name: "First", preset: {} },
    { type: "RESOLVED", name: "Second", preset: {} },
  ];
  expect(Selectors.getRandomizePresets(store.getState())).toBe(true);
  store.dispatch(Actions.toggleRandomizePresets());
  expect(Selectors.getRandomizePresets(store.getState())).toBe(false);

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

test("selectes the first preset in a new set when added", async () => {
  const store = createStore(media, new Emitter());
  const mockPreset = [
    { type: "RESOLVED", name: "First", preset: {} },
    { type: "RESOLVED", name: "Second", preset: {} },
  ];
  store.dispatch(Actions.toggleRandomizePresets());

  // Load some presets
  store.dispatch(Actions.loadPresets(mockPreset));
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(0);

  const presetPromise = Promise.resolve({});
  // Load some more presets
  const newMockPresets = [
    { type: "UNRESOLVED", name: "First", getPreset: () => presetPromise },
  ];
  store.dispatch(Actions.loadPresets(newMockPresets));
  // The new presets are not selected right away
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(0);
  await presetPromise;
  // Once the first preset is loaded, it gets selected
  expect(Selectors.getCurrentPresetIndex(store.getState())).toBe(2);
});
