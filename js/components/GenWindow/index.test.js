import React from "react";
import renderer from "react-test-renderer";

import { GenWindow } from "./index";

describe("GenWindow", () => {
  it("renders to snapshot", () => {
    const tree = renderer
      .create(
        <GenWindow
          title="My Window"
          selected
          close={() => {}}
          windowId="TEST_WINDOW_ID"
          scrollVolume={() => {}}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
