import React from "react";
import { connect } from "react-redux";
import * as Actions from "../actionCreators";
import { Hr, Node, Parent } from "./ContextMenu";

const SkinContextMenu = props => (
  <Parent label="Skins">
    <Node onClick={props.openSkinFileDialog} label="Load Skin..." />
    <Hr />
    <Node onClick={props.loadDefaultSkin} label={"<Base Skin>"} />
    {props.availableSkins.map(skin => (
      <Node
        key={skin.url}
        onClick={() => props.setSkin(skin.url)}
        label={skin.name}
      />
    ))}
  </Parent>
);

const mapStateToProps = state => ({
  availableSkins: state.settings.availableSkins
});

const mapDispatchToProps = {
  loadDefaultSkin: Actions.loadDefaultSkin,
  openSkinFileDialog: Actions.openSkinFileDialog,
  setSkin: Actions.setSkinFromUrl
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SkinContextMenu);
