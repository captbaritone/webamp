import * as React from "react";
import LibraryLayout from "./LibraryLayout";

export default class MediaLibraryWindow extends React.Component<{}> {
  render() {
    return (
      <LibraryLayout
        sidebar={null}
        artists={null}
        albums={null}
        tracks={null}
      />
    );
  }
}
