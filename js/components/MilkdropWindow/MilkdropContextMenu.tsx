import React, { ReactNode } from "react";
import { Hr, Node } from "../ContextMenu";
import { connect } from "react-redux";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { AppState, Dispatch } from "../../types";
import ContextMenuWraper from "../ContextMenuWrapper";
import { pictureInPictureIsSupported } from "../../pictureInPicture";

interface StateProps {
  desktop: boolean;
  fullscreen: boolean;
  pictureInPicture: boolean;
}

interface DispatchProps {
  closeWindow(): void;
  toggleDesktop(): void;
  toggleFullscreen(): void;
  togglePictureInPicture(): void;
}

interface OwnProps {
  children: ReactNode;
}

type Props = StateProps & DispatchProps & OwnProps;

const MilkdropContextMenu = (props: Props) => (
  <ContextMenuWraper
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
          {pictureInPictureIsSupported() && (
            <Node
              onClick={props.togglePictureInPicture}
              checked={props.pictureInPicture}
              label="Picture-in Picture"
              hotkey="Alt+D"
            />
          )}
          <Hr />
          <Node onClick={props.closeWindow} label="Quit" />
        </>
      );
    }}
  >
    {props.children}
  </ContextMenuWraper>
);

const mapStateToProps = (state: AppState): StateProps => ({
  desktop: Selectors.getMilkdropDesktopEnabled(state),
  fullscreen: Selectors.getMilkdropFullscreenEnabled(state),
  pictureInPicture: Selectors.getMilkdropPictureInPictureEnabled(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  toggleDesktop: () => dispatch(Actions.toggleMilkdropDesktop()),
  toggleFullscreen: () => dispatch(Actions.toggleMilkdropFullscreen()),
  togglePictureInPicture: () => dispatch(Actions.togglePictureInPicture()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MilkdropContextMenu);
