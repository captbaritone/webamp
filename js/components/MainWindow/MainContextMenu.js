import React from "react";
import { connect } from "react-redux";
import { close, setSkinFromUrl, openFileDialog } from "../../actionCreators";
import { ContextMenu, Hr, Node, Parent, LinkNode } from "../ContextMenu";
import base from "../../../skins/base-2.91.wsz";
import osx from "../../../skins/MacOSXAqua1-5.wsz";
import topaz from "../../../skins/TopazAmp1-2.wsz";
import visor from "../../../skins/Vizor1-01.wsz";
import xmms from "../../../skins/XMMS-Turquoise.wsz";
import zaxon from "../../../skins/ZaxonRemake1-0.wsz";

const SKINS = [
  { url: base, name: "<Base Skin>" },
  { url: osx, name: "Mac OSX v1.5 (Aqua)" },
  { url: topaz, name: "TopazAmp" },
  { url: visor, name: "Vizor" },
  { url: xmms, name: "XMMS Turquoise " },
  { url: zaxon, name: "Zaxon Remake" }
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
          key={skin.url}
          onClick={() => props.setSkin(skin.url)}
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
  setSkin: url => dispatch(setSkinFromUrl(url))
});

export default connect(null, mapDispatchToProps)(MainContextMenu);
