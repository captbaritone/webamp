import React from "react";
import { connect } from "react-redux";
import {
  close,
  setSkinFromFilename,
  openFileDialog
} from "../../actionCreators";
import { ContextMenu, Hr, Node, Parent, LinkNode } from "../ContextMenu";

const SKINS = [
  { file: "base-2.91.wsz", name: "<Base Skin>" },
  { file: "MacOSXAqua1-5.wsz", name: "Mac OSX v1.5 (Aqua)" },
  { file: "TopazAmp1-2.wsz", name: "TopazAmp" },
  { file: "Vizor1-01.wsz", name: "Vizor" },
  { file: "XMMS-Turquoise.wsz", name: "XMMS Turquoise " },
  { file: "ZaxonRemake1-0.wsz", name: "Zaxon Remake" }
];

const MainContextMenu = props => (
  <ContextMenu
    id="option-context"
    bottom
    handle={<div id="option" title="Winamp Menu" />}
  >
    <LinkNode
      href="https://github.com/captbaritone/winamp2-js"
      target="_blank"
      label="Winamp2-js"
    />
    <Hr />
    <Node onClick={props.openFileDialog} label="Play File..." />
    <Parent label="Skins">
      <Node onClick={props.openFileDialog} label="Load Skin..." />
      <Hr />
      {SKINS.map(skin => (
        <Node
          key={skin.file}
          onClick={props.setSkin.bind(null, skin.file)}
          label={skin.name}
        />
      ))}
    </Parent>
    <Hr />
    <Node onClick={props.close} label="Exit" />
  </ContextMenu>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  close: () => dispatch(close()),
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput)),
  setSkin: filename => dispatch(setSkinFromFilename(filename))
});

export default connect(null, mapDispatchToProps)(MainContextMenu);
