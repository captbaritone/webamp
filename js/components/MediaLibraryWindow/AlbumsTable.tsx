import * as React from "react";
import LibraryTable from "./LibraryTable";

interface Props {}

export default class AlbumsTable extends React.Component<Props> {
  render() {
    return (
      <LibraryTable
        headings={["Album", "Tracks"]}
        rows={[["All (1 album)", "1"], ["Ben Mason", "1"]]}
        widths={[50, 200]}
      />
    );
  }
}
