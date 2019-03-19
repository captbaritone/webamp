import React from "react";
import { connect } from "react-redux";
import * as Actions from "../actionCreators";
import { Hr, Node, Parent } from "./ContextMenu";
import { AppState, Skin, Dispatch } from "../types";

interface StateProps {
  availableSkins: Skin[];
}

interface DispatchProps {
  loadDefaultSkin(): void;
  setSkin(url: string): void;
  openSkinFileDialog(): void;
}

type Props = StateProps & DispatchProps;

const SkinContextMenu = (props: Props) => (
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

const mapStateToProps = (state: AppState): StateProps => ({
  availableSkins: state.settings.availableSkins,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    loadDefaultSkin() {
      dispatch(Actions.loadDefaultSkin());
    },
    openSkinFileDialog() {
      dispatch(Actions.openSkinFileDialog());
    },
    setSkin(url: string) {
      dispatch(Actions.setSkinFromUrl(url));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SkinContextMenu);
