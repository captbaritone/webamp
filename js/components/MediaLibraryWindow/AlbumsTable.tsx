import * as React from "react";
import LibraryTable from "./LibraryTable";

const AlbumsTable = React.memo(() => {
  return (
    <LibraryTable
      headings={["Album", "Tracks"]}
      rows={[
        ["All (1 album)", "1"],
        ["Ben Mason", "1"],
      ]}
      widths={[50, 200]}
    />
  );
});

export default AlbumsTable;
