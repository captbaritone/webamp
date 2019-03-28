import * as React from "react";
import LibraryTable from "./LibraryTable";

interface Props {}

export default class ArtistsTable extends React.Component<Props> {
  render() {
    return (
      <LibraryTable
        headings={["Album", "Tracks", "Other"]}
        rows={[["All (1 album)", "1", "1"], ["Ben Mason", "1", "1"]]}
        widths={[100, 150, 200]}
      />
    );
  }
}
