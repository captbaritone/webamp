import * as React from "react";
import { connect } from "react-redux";
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
    const cellStyle: React.CSSProperties = {
      whiteSpace: "nowrap"
    };
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "[artist] 1fr [title] 1fr [album] 1fr [length] 1fr [track number] 1fr [genere] 1fr [year] 1fr [filename] 1fr",
              gridColumnGap: 1
            }}
          >
            <div style={cellStyle}>Artist</div>
            <div style={cellStyle}>Title</div>
            <div style={cellStyle}>Album</div>
            <div style={cellStyle}>Length</div>
            <div style={cellStyle}>Track #</div>
            <div style={cellStyle}>Genere</div>
            <div style={cellStyle}>Year</div>
            <div style={cellStyle}>Filename</div>

            {this.props.filterTracks(this.state.filter).map(track => {
              return (
                <React.Fragment key={track.id}>
                  <div style={cellStyle}>{track.artist}</div>
                  <div style={cellStyle}>{track.title}</div>
                  <div style={cellStyle}>{track.album}</div>
                  <div style={cellStyle}>
                    {Utils.getTimeStr(track.duration)}
                  </div>
                  <div style={cellStyle}>1</div>
                  <div style={cellStyle}>Primus</div>
                  <div style={cellStyle}>2001</div>
                  <div style={cellStyle}>
                    {track.url == null
                      ? track.defaultName
                      : FileUtils.filenameFromUrl(track.url)}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {/*
          <table
            className="webamp-media-library-table"
            style={{ overflow: "scroll" }}
          >
            <thead>
              <tr>
              </tr>
            </thead>
            <tbody>
             
            </tbody>
          </table> */}
        </div>
        <div style={{ marginTop: 2 }}>
          <button>Play</button>
          <button>Enqueue</button>
          <button>Play all</button>
          <button>Enqueue all</button>
          <span id="webamp-media-library-track-summary-duration">
            1 item [3:25]
          </span>
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
