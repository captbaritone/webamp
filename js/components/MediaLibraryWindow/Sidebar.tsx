import * as React from "react";
import LibraryButton from "./LibraryButton";

export default class Sidebar extends React.Component {
  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div className="webamp-media-library-item" style={{ flexGrow: 1 }}>
          <ul style={{ margin: 3 }}>
            <li>
              Local Media
              <ul>
                <li>Audio</li>
                <li>Video</li>
              </ul>
            </li>
            <li>Playlist</li>
            <li>
              Devices
              <ul>
                <li>CD E:</li>
              </ul>
            </li>
            <li>Internet Radio</li>
            <li>Internet TV</li>
          </ul>
        </div>
        <LibraryButton
          style={{
            width: "100%",
            marginTop: 1,
          }}
        >
          Library
        </LibraryButton>
      </div>
    );
  }
}
