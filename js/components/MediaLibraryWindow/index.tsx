import * as React from "react";
import "../../../css/media-library-window.css";
import Sidebar from "./Sidebar";
import ArtistsTable from "./ArtistsTable";
import AlbumsTable from "./AlbumsTable";
import TracksTable from "./TracksTable";
import LibraryLayout from "./LibraryLayout";

export default class MediaLibraryWindow extends React.Component<{}> {
  render() {
    return (
      <React.StrictMode>
        <LibraryLayout
          sidebar={<Sidebar />}
          artists={<ArtistsTable />}
          albums={<AlbumsTable />}
          tracks={<TracksTable />}
        />
      </React.StrictMode>
    );
  }
}
