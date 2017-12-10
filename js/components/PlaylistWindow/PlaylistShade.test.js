const media = {
  addEventListener: jest.fn(),
  loadFromUrl: jest.fn(),
  _analyser: null
};

window.requestAnimationFrame = () => {};

import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../../store";
import { loadMediaFromUrl } from "../../actionCreators";

import PlaylistShade from "./PlaylistShade";

describe("PlaylistShade", () => {
  let store;
  beforeEach(() => {
    store = getStore(media);
  });

  it("renders to snapshot", () => {
    store.dispatch(loadMediaFromUrl("http://example.com", "Some Name", false));
    console.log(store.getState().playlist.tracks[0]);
    const tree = renderer
      .create(
        <Provider store={store}>
          <PlaylistShade />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
