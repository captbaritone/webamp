import * as React from "react";
import { connect } from "react-redux";
import * as Selectors from "../../selectors";
import { AppState, PlaylistTrack } from "../../types";
import * as Utils from "../../utils";
import * as FileUtils from "../../fileUtils";
import LibraryButton from "./LibraryButton";
import LibraryTable from "./LibraryTable";

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
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: 23,
          }}
        >
          <span>Search:</span>
          <input
            style={{ marginLeft: 12, flexGrow: 1 }}
            type="text"
            className="webamp-media-library-item"
            onChange={e => this.setState({ filter: e.target.value })}
          />
        </div>
        <LibraryTable
          headings={[
            "Artist",
            "Title",
            "Album",
            "Length",
            "Track #",
            "Genere",
            "Year",
            "Filename",
          ]}
          rows={this.props.filterTracks(this.state.filter).map(track => {
            return [
              track.artist,
              track.title,
              track.album,
              Utils.getTimeStr(track.duration),
              1,
              "Primus",
              2001,
              track.url == null
                ? track.defaultName
                : FileUtils.filenameFromUrl(track.url),
            ];
          })}
          widths={[100, 100, 100, 100, 100, 100, 100, 100]}
        />

        <div style={{ marginTop: 2 }}>
          <LibraryButton>Play</LibraryButton>
          <LibraryButton>Enqueue</LibraryButton>
          <LibraryButton>Play all</LibraryButton>
          <LibraryButton>Enqueue all</LibraryButton>
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
    filterTracks: Selectors.getTracksMatchingFilter(state),
  };
};

export default connect(mapStateToProps)(TracksTable);
