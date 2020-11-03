import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import Emitter from "../../emitter";
import getStore from "../../store";
import { loadMediaFiles } from "../../actionCreators";

import PlaylistShade from "./PlaylistShade";

const media = {
  addEventListener: jest.fn(),
  loadFromUrl: jest.fn(),
  setVolume: jest.fn(),
  setPreamp: jest.fn(),
  setBalance: jest.fn(),
  getAnalyser: () => null,
  on: jest.fn(),
};

describe("PlaylistShade", () => {
  let store;
  beforeEach(() => {
    store = getStore(media, new Emitter());
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
