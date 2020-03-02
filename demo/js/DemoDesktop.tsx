import WebampLazy from "../../js/webampLazy";
import React from "react";
import WebampIcon from "./WebampIcon";

interface Props {
  webamp: WebampLazy;
}

const DemoDesktop = ({ webamp }: Props) => {
  return (
    <div
      id="desktop"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <WebampIcon webamp={webamp} />
    </div>
  );
};

export default DemoDesktop;
