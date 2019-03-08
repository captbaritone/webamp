import React from "react";
import { Hr, Node } from "../ContextMenu";
import { connect } from "react-redux";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { AppState, Dispatch } from "../../types";
import ContextMenuWraper from "../ContextMenuWrapper";

interface StateProps {
  desktop: boolean;
}

interface DispatchProps {
  toggleFullscreen(): void;
  closeWindow(): void;
  toggleDesktop(): void;
}

type Props = StateProps & DispatchProps;

const MilkdropContextMenu = (props: Props) => (
  <ContextMenuWraper
    onDoubleClick={props.toggleFullscreen}
    renderContents={() => {
      return (
        <>
          <Node
            onClick={props.toggleFullscreen}
            label="Fullscreen"
            hotkey="Alt+Enter"
          />
          <Node
            onClick={props.toggleDesktop}
            checked={props.desktop}
            label="Desktop Mode"
            hotkey="Alt+D"
          />
          <Hr />
          <Node onClick={props.closeWindow} label="Quit" />
        </>
      );
    }}
  />
);

const mapStateToProps = (state: AppState): StateProps => ({
  desktop: Selectors.getMilkdropDesktopEnabled(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  toggleDesktop: () => dispatch(Actions.toggleMilkdropDesktop()),
  toggleFullscreen: () => {
    throw new Error("Implement fullscreen");
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MilkdropContextMenu);
