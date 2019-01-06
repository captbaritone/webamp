import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../../store";
import { SET_SKIN_DATA } from "../../actionTypes";
import Emitter from "../../emitter";

import MainWindow from "./index";

const media = {
  addEventListener: jest.fn(),
  setVolume: jest.fn(),
  setBalance: jest.fn(),
  setPreamp: jest.fn(),
  getAnalyser: () => null,
  on: jest.fn()
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

describe("MainWindow", () => {
  let store;
  beforeEach(() => {
    store = getStore(media, new Emitter());
    store.dispatch({ type: SET_SKIN_DATA, data: {} });
  });

  it("renders to snapshot", () => {
    const options = { createNodeMock };
    const tree = renderer
      .create(
        <Provider store={store}>
          <MainWindow mediaPlayer={media} />
        </Provider>,
        options
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
