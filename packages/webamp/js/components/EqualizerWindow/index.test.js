import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../../store";

import EqualizerWindow from "./index";
const media = {
  addEventListener: jest.fn(),
  setVolume: jest.fn(),
  setPreamp: jest.fn(),
  setBalance: jest.fn(),
  getAnalyser: () => null,
  on: jest.fn(),
};

const canvasMockify = require("canvas-mock");

function createNodeMock(element) {
  if (element.type === "canvas") {
    const Canvas = window.document.createElement("canvas");
    canvasMockify(Canvas); // mock canvas functions required by Phaser.js are added
    return Canvas;
  }
  return null;
}

describe("EqualizerWindow", () => {
  let store;
  beforeEach(() => {
    store = getStore(media);
  });

  it("renders to snapshot", () => {
    const options = { createNodeMock };
    const tree = renderer
      .create(
        <Provider store={store}>
          <EqualizerWindow />
        </Provider>,
        options
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
