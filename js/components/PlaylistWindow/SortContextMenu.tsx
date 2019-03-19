import React from "react";
import { connect } from "react-redux";
import {
  reverseList,
  randomizeList,
  sortListByTitle,
} from "../../actionCreators";

import { Hr, Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { Dispatch } from "../../types";

interface DispatchProps {
  sortListByTitle: () => void;
  reverseList: () => void;
  randomizeList: () => void;
}

/* eslint-disable no-alert */
/* TODO: This should really be kitty-corner to the upper right hand corner of the MiscMenu */
const SortContextMenu = (props: DispatchProps) => (
  <ContextMenuTarget
    style={{ width: "100%", height: "100%" }}
    top
    handle={<div />}
  >
    <Node label="Sort list by title" onClick={props.sortListByTitle} />
    <Hr />
    <Node label="Reverse list" onClick={props.reverseList} />
    <Node label="Randomize list" onClick={props.randomizeList} />
  </ContextMenuTarget>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    reverseList: () => dispatch(reverseList()),
    randomizeList: () => dispatch(randomizeList()),
    sortListByTitle: () => dispatch(sortListByTitle()),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(SortContextMenu);
