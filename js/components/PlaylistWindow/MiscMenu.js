import React from "react";
import { connect } from "react-redux";
import {
  reverseList,
  randomizeList,
  sortListByTitle
} from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { ContextMenu, Hr, Node } from "../ContextMenu";

/* eslint-disable no-alert */
/* TODO: This should really be kitty-corner to the upper right hand corner of the MiscMenu */
const SortContextMenu = props => (
  <ContextMenu style={{ width: "100%", height: "100%" }} top handle={<div />}>
    <Node label="Sort list by title" onClick={props.sortListByTitle} />
    <Hr />
    <Node label="Reverse list" onClick={props.reverseList} />
    <Node label="Randomize list" onClick={props.randomizeList} />
  </ContextMenu>
);

const ConnectedSortcontextMenu = connect(null, {
  reverseList,
  randomizeList,
  sortListByTitle
})(SortContextMenu);

const MiscMenu = () => (
  <PlaylistMenu id="playlist-misc-menu">
    <div className="sort-list" onClick={e => e.stopPropagation()}>
      <ConnectedSortcontextMenu />
    </div>
    <div
      className="file-info"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div
      className="misc-options"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
  </PlaylistMenu>
);

export default MiscMenu;
