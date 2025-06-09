import React from "react";
import { useActionCreator } from "./hooks";
import { SCREENSHOT_WIDTH } from "./constants";

function getScaleForColumnCount(columnCount, windowWidth) {
  return windowWidth / (columnCount * SCREENSHOT_WIDTH);
}

const BACKGROUND_COLOR = "#000";

const Zoom = ({ columnCount, windowWidth }) => {
  const scaleUp = getScaleForColumnCount(columnCount - 1, windowWidth);
  const scaleDown = getScaleForColumnCount(columnCount + 1, windowWidth);
  const zoom = useActionCreator((scale) => ({ type: "SET_SCALE", scale }));
  const zoomIn = () => zoom(scaleUp);
  const zoomOut = () => zoom(scaleDown);

  return (
    <div
      id="zoom"
      style={{
        position: "absolute",
        backgroundColor: BACKGROUND_COLOR,
        background: `linear-gradient(
          0deg,
          rgba(17, 17, 25, 1) 0%,
          rgba(40, 39, 66, 1) 66%,
          rgba(25, 25, 39, 1) 100%
        )`,
        boxShadow: "10px 10px 15px 0px rgb(0 0 0 / 85%)",
        bottom: 5,
        right: 5,
        display: "flex",
        flexDirection: "column",
        border: "1px solid black",
        borderStyle: "solid",
        borderWidth: "1px",
        borderBottomColor: "rgb(87, 86, 102)",
        borderTopColor: "rgb(32, 31, 51)",
        borderRadius: 5,
      }}
    >
      <Button
        title={"Zoom In"}
        onClick={zoomIn}
        disabled={scaleUp * SCREENSHOT_WIDTH >= 400}
        style={{ margin: 0 }}
      >
        +
      </Button>
      <hr
        style={{
          border: "none",
          backgroundColor: "rgba(255, 2550, 2550, 0.2)",
          color: "rgba(255, 2550, 2550, 0.4)",
          height: 1,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 3,
          marginRight: 3,
          padding: 0,
        }}
      />
      <Button
        onClick={zoomOut}
        title={"Zoom Out"}
        disabled={scaleDown * SCREENSHOT_WIDTH <= 100}
      >
        {"–"}
      </Button>
    </div>
  );
};

function Button({ ...props }) {
  return (
    <button
      {...props}
      title={props.disabled ? `${props.title} (disabled)` : props.title}
      style={{
        margin: 0,
        border: "none",
        cursor: props.disabled ? "default" : "pointer",
        font: "inherit",
        fontWeight: "bold",
        outline: "inherit",
        background: "none",
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 9,
        paddingBottom: 9,
      }}
    />
  );
}

export default Zoom;
