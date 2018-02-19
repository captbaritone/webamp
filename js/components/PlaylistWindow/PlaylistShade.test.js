import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../../store";
import { loadMediaFiles } from "../../actionCreators";

import PlaylistShade from "./PlaylistShade";

const media = {
  addEventListener: jest.fn(),
  loadFromUrl: jest.fn(),
  setVolume: jest.fn(),
  setBalance: jest.fn(),
  _analyser: null
};

describe("PlaylistShade", () => {
  let store;
  beforeEach(() => {
    store = getStore(media);
  });

  it("renders to snapshot", () => {
    store.dispatch(
      loadMediaFiles([{ url: "http://example.com", defaultName: "Some Name" }])
    );
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
