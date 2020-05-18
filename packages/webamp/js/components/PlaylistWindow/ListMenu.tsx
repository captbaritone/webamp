import React from "react";
import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { useActionCreator } from "../../hooks";

/* eslint-disable no-alert */
export default function ListMenu() {
  const removeAllTracks = useActionCreator(Actions.removeAllTracks);
  return (
    <PlaylistMenu id="playlist-list-menu">
      <div className="new-list" onClick={removeAllTracks} />
      <div
        className="save-list"
        onClick={() => alert("Not supported in Webamp")}
      />
      <div
        className="load-list"
        onClick={() => alert("Not supported in Webamp")}
      />
    </PlaylistMenu>
  );
}
