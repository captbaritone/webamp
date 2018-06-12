import React from "react";
import DropTarget from "../DropTarget";

const Background = props => {
  const { innerRef, handleDrop, ...restProps } = props;
  return (
    <DropTarget handleDrop={handleDrop}>
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
          width: "100%"
        }}
        tabIndex="0"
        {...restProps}
      />
    </DropTarget>
  );
};

export default Background;
