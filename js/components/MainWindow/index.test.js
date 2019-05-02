import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import mockGetStore from "../../__mocks__/storeMock";
import media from "../../__mocks__/mediaMock";
import { SET_SKIN_DATA } from "../../actionTypes";

import MainWindow from "./index";

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
    store = mockGetStore();
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
