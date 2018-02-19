import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";
import {
  close,
  setSkinFromUrl,
  openMediaFileDialog,
  openSkinFileDialog
} from "../../actionCreators";
import { ContextMenu, Hr, Node, Parent, LinkNode } from "../ContextMenu";

const MainContextMenu = props => (
  <ContextMenu
    id="option-context"
    bottom
    handle={<ClickedDiv id="option" title="Winamp Menu" />}
  >
    <LinkNode
      href="https://github.com/captbaritone/winamp2-js"
      target="_blank"
      label="Winamp2-js"
    />
    <Hr />
    <Node onClick={props.openMediaFileDialog} label="Play File..." />
    <Parent label="Skins">
      <Node onClick={props.openSkinFileDialog} label="Load Skin..." />
      {!!props.avaliableSkins.length && <Hr />}
      {props.avaliableSkins.map(skin => (
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

const mapStateToProps = state => ({
  avaliableSkins: state.settings.avaliableSkins
});

const mapDispatchToProps = {
  close,
  openSkinFileDialog,
  openMediaFileDialog,
  setSkin: setSkinFromUrl
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContextMenu);
