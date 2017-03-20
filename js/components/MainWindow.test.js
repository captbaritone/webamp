const Winamp = {
  media: {
    addEventListener: jest.fn(),
    _analyser: null
  }
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

window.requestAnimationFrame = () => {};

import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import getStore from "../store";

import MainWindow from "./MainWindow";

describe("MainWindow", () => {
  let store;
  beforeEach(() => {
    store = getStore(Winamp);
  });

  it("renders to snapshot", () => {
    const options = { createNodeMock };
    const tree = renderer
      .create(
        <Provider store={store}>
          <MainWindow winamp={Winamp} mediaPlayer={Winamp.media} />
        </Provider>,
        options
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
