import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import "../../../css/gen-window.css";

const Text = ({ children }) => {
  const letters = children.split("");
  return letters.map((letter, i) => (
    <div
      key={i}
      className={`draggable gen-text-letter gen-text-${
        letter === " " ? "space" : letter.toLowerCase()
      }`}
    />
  ));
};

const GenWindow = ({ selected, children, close, title }) => (
  <div className={classnames("gen-window", "window", { selected })}>
    <div className="gen-top draggable">
      <div className="gen-top-left draggable" />
      <div className="gen-top-left-right-fill draggable" />
      <div className="gen-top-left-end draggable" />
      <div className="gen-top-title draggable">
        <Text>{title}</Text>
      </div>
      <div className="gen-top-right-end draggable" />
      <div className="gen-top-left-right-fill draggable" />
      <div className="gen-top-right draggable">
        <div className="gen-close selected" onClick={close} />
      </div>
    </div>
    <div className="gen-middle">
      <div className="gen-middle-left draggable">
        <div className="gen-middle-left-bottom draggable" />
      </div>
      <div className="gen-middle-center">{children}</div>
      <div className="gen-middle-right draggable">
        <div className="gen-middle-right-bottom draggable" />
      </div>
    </div>
    <div className="gen-bottom draggable">
      <div className="gen-bottom-left draggable" />
      <div className="gen-bottom-right draggable" />
    </div>
  </div>
);

GenWindow.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  close: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired
};

export default GenWindow;
