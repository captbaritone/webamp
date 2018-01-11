import React from "react";
import renderer from "react-test-renderer";

import GenWindow from "./index";

describe("GenWindow", () => {
  it("renders to snapshot", () => {
    const tree = renderer
      .create(<GenWindow title="My Window" selected close={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
