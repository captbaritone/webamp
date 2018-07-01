import React from "react";
import { Hr, Node } from "../ContextMenu";

const MilkdropContextMenu = props => (
  <React.Fragment>
    <Node
      onClick={props.toggleFullscreen}
      label="Fullscreen"
      hotkey="Alt+Enter"
    />
    <Node onClick={props.enableDesktop} label="Desktop Mode" hotkey="Alt+D" />
    <Hr />
    <Node onClick={props.close} label="Quit" />
  </React.Fragment>
);

export default MilkdropContextMenu;
