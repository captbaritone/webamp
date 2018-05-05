import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleRepeat } from "../../actionCreators";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";

const Repeat = ({ repeat, handleClick }) => (
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

const mapStateToProps = state => ({
  repeat: state.media.repeat
});

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch(toggleRepeat())
});

export default connect(mapStateToProps, mapDispatchToProps)(Repeat);
