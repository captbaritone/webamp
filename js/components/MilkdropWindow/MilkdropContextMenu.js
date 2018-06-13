import React from "react";
import { /*Hr, */ Node } from "../ContextMenu";

const MilkdropContextMenu = props => (
  <React.Fragment>
    {/*
    <Node onClick={props.fullscreen} label="Fullscreen" />
    <Hr />
      */}
    <Node onClick={props.close} label="Quit" />
  </React.Fragment>
);

export default MilkdropContextMenu;
