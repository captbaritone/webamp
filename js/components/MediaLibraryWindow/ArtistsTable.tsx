import * as React from "react";

interface Props {}

export default class ArtistsTable extends React.Component<Props> {
  render() {
    return (
      <div className="webamp-media-library-item" style={{ height: "100%" }}>
        <table className="webamp-media-library-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Album</th>
              <th>Tracks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All (1 artist)</td>
              <td>1</td>
              <td>1</td>
            </tr>
            <tr>
              <td>Ben Mason</td>
              <td>1</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
