import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleShuffle } from "../../actionCreators";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";

const Shuffle = ({ shuffle, handleClick }) => (
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
const mapStateToProps = state => ({
  shuffle: state.media.shuffle
});

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch(toggleShuffle())
});
export default connect(mapStateToProps, mapDispatchToProps)(Shuffle);
