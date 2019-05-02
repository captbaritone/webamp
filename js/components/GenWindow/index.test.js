import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import mockGetStore from "../../__mocks__/storeMock";

import { GenWindow } from "./index";

describe("GenWindow", () => {
  let store;
  beforeEach(() => {
    store = mockGetStore();
  });
  it("renders to snapshot", () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <GenWindow
            title="My Window"
            selected
            close={() => {}}
            windowId="TEST_WINDOW_ID"
            scrollVolume={() => {}}
            windowSize={[0, 0]}
          >
            {() => {}}
          </GenWindow>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
