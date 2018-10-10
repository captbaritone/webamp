import * as React from "react";

interface Props {}

export default class TracksTable extends React.Component<Props> {
  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 2
        }}
      >
        <div
          style={{ paddingBottom: 3, display: "flex", flexDirection: "row" }}
        >
          <span>Search:</span>
          <input
            style={{ marginLeft: 12, flexGrow: 1 }}
            type="text"
            className="webamp-media-library-item"
          />
        </div>
        <div
          style={{ flexGrow: 1, overflowY: "scroll" }}
          className="webamp-media-library-item"
        >
          <table
            className="webamp-media-library-table"
            style={{ overflow: "scroll" }}
          >
            <thead>
              <tr>
                <th>Artist</th>
                <th>Title</th>
                <th>Album</th>
                <th>Length</th>
                <th>Track #</th>
                <th>Genere</th>
                <th>Year</th>
                <th>Filename</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ben Mason</td>
                <td>Easy</td>
                <td>Bad Pands</td>
                <td>3:25</td>
                <td>1</td>
                <td>Primus</td>
                <td>2001</td>
                <td>BenMason-Easy.mp3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 2 }}>
          <button>Play</button>
          <button>Enqueue</button>
          <button>Play all</button>
          <button>Enqueue all</button>
          <span>1 item [3:25]</span>
        </div>
      </div>
    );
  }
}
