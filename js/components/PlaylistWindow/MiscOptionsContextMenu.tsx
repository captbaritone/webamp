import React from "react";
import { connect } from "react-redux";
import { Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { Dispatch } from "../../types";
import { downloadHtmlPlaylist } from "../../actionCreators";

interface DispatchProps {
  downloadHtmlPlaylist: () => void;
}

const MiscOptionsContextMenu = (props: DispatchProps) => (
  <ContextMenuTarget
    top
    renderMenu={() => (
      <Node
        onClick={props.downloadHtmlPlaylist}
        label="Generate HTML playlist"
      />
    )}
  >
    <div />
  </ContextMenuTarget>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    downloadHtmlPlaylist: () => dispatch(downloadHtmlPlaylist()),
  };
};
export const ConnectedMiscOptionsContextMenu = connect(
  null,
  mapDispatchToProps
)(MiscOptionsContextMenu);
