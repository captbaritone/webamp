import * as React from "react";

interface Props {
  innerRef?: (node: HTMLDivElement) => void;
  children: React.ReactNode;
}

const Background = (props: Props) => {
  const { innerRef } = props;
  return (
    <div
      ref={innerRef}
      className="draggable"
      style={{
        // This color will be used until Butterchurn is loaded
        backgroundColor: "#000",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",
        width: "100%",
      }}
      tabIndex={0}
    >
      {props.children}
    </div>
  );
};

export default Background;
