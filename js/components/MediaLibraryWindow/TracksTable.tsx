import * as React from "react";
import { connect } from "react-redux";
import { cursorSelectors } from "../../skinSelectors";
import * as Selectors from "../../selectors";
import * as Utils from "../../utils";
import * as FileUtils from "../../fileUtils";
import { AppState, PlaylistTrack } from "../../types";

interface StateProps {
  tracks: PlaylistTrack[];
  filterTracks: (query: string) => PlaylistTrack[];
}

interface State {
  filter: string;
}

class TracksTable extends React.Component<StateProps, State> {
  constructor(props: StateProps) {
    super(props);
    this.state = { filter: "" };
  }
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
            onChange={e => this.setState({ filter: e.target.value })}
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
              {this.props.filterTracks(this.state.filter).map(track => {
                return (
                  <tr key={track.id}>
                    <td>{track.artist}</td>
                    <td>{track.title}</td>
                    <td>{track.album}</td>
                    <td>{Utils.getTimeStr(track.duration)}</td>
                    <td>1</td>
                    <td>Primus</td>
                    <td>2001</td>
                    <td>
                      {track.url == null
                        ? track.defaultName
                        : FileUtils.filenameFromUrl(track.url)}
                    </td>
                  </tr>
                );
              })}
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

const mapStateToProps = (state: AppState): StateProps => {
  return {
    tracks: Object.values(Selectors.getTracks(state)),
    filterTracks: Selectors.getTracksMatchingFilter(state)
  };
};

export default connect(mapStateToProps)(TracksTable);
