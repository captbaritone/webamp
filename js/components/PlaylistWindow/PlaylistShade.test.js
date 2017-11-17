const media = {
  addEventListener: jest.fn(),
  _analyser: null
};

window.requestAnimationFrame = () => {};

import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../../store";

import PlaylistShade from "./PlaylistShade";

describe("PlaylistShade", () => {
  let store;
  beforeEach(() => {
    store = getStore(media);
  });

  it("renders to snapshot", () => {
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
