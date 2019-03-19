import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleRepeat } from "../../actionCreators";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  repeat: boolean;
}

interface DispatchProps {
  handleClick(): void;
}

type Props = StateProps & DispatchProps;

const Repeat = ({ repeat, handleClick }: Props) => (
  <ContextMenuWraper
    renderContents={() => (
      <Node
        checked={repeat}
        label="Repeat"
        onClick={handleClick}
        hotkey="(R)"
      />
    )}
  >
    <div
      id="repeat"
      className={classnames({ selected: repeat })}
      onClick={handleClick}
      title="Toggle Repeat"
    />
  </ContextMenuWraper>
);

const mapStateToProps = (state: AppState): StateProps => ({
  repeat: state.media.repeat,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  handleClick: () => dispatch(toggleRepeat()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Repeat);
