import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleShuffle } from "../../actionCreators";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";
import { Dispatch, AppState } from "../../types";

interface StateProps {
  shuffle: boolean;
}

interface DispatchProps {
  handleClick(): void;
}

type Props = StateProps & DispatchProps;
const Shuffle = ({ shuffle, handleClick }: Props) => (
  <ContextMenuWraper
    renderContents={() => (
      <Node
        checked={shuffle}
        label="Shuffle"
        onClick={handleClick}
        hotkey="(S)"
      />
    )}
  >
    <div
      id="shuffle"
      className={classnames({ selected: shuffle })}
      onClick={handleClick}
      title="Toggle Shuffle"
    />
  </ContextMenuWraper>
);

const mapStateToProps = (state: AppState): StateProps => ({
  shuffle: state.media.shuffle,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  handleClick: () => dispatch(toggleShuffle()),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Shuffle);
