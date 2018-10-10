import * as React from "react";

interface Props {}

export default class AlbumsTable extends React.Component<Props> {
  render() {
    return (
      <div className="webamp-media-library-item" style={{ flexGrow: 1 }}>
        <table
          className="webamp-media-library-table"
          style={{ overflow: "scroll" }}
        >
          <thead>
            <tr>
              <th>Album</th>
              <th>Tracks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All (1 album)</td>
              <td>1</td>
            </tr>
            <tr>
              <td>Ben Mason</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
