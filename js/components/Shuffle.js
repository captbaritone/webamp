import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleShuffle } from "../actionCreators";

const Shuffle = ({ shuffle, handleClick }) => (
  <div
    id="shuffle"
    className={classnames({ selected: shuffle })}
    onClick={handleClick}
  />
);
const mapStateToProps = state => ({
  shuffle: state.media.shuffle
});

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch(toggleShuffle())
});
export default connect(mapStateToProps, mapDispatchToProps)(Shuffle);
