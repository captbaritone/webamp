import * as React from "react";
import { connect } from "react-redux";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import "../../../css/media-library-window.css";
import { AppState, SkinGenExColors } from "../../types";
import * as Selectors from "../../selectors";
import Sidebar from "./Sidebar";
import ArtistsTable from "./ArtistsTable";
import AlbumsTable from "./AlbumsTable";
import TracksTable from "./TracksTable";

interface Props {
  skinGenExColors: SkinGenExColors;
}

interface State {
  sidebarWidth: number;
  topPlaylistSectionHeight: number;
  artistsPanelWidth: number;
}

class MediaLibraryWindow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sidebarWidth: 100,
      topPlaylistSectionHeight: 200,
      artistsPanelWidth: 150
    };
  }

  _onMouseMove(cb: (e: MouseEvent) => void) {
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", cb);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", cb);
    document.addEventListener("mouseup", handleMouseUp);
  }

  _handleSidebarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageX: startX } = e;
    const initialWidth = this.state.sidebarWidth;
    this._onMouseMove((moveEvent: MouseEvent) => {
      this.setState({
        sidebarWidth: initialWidth + moveEvent.pageX - startX
      });
    });
  };

  _handlePlaylistResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageY: startY } = e;
    const initialHeight = this.state.topPlaylistSectionHeight;
    this._onMouseMove((moveEvent: MouseEvent) => {
      this.setState({
        topPlaylistSectionHeight: initialHeight + moveEvent.pageY - startY
      });
    });
  };

  _handleArtistsResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageX: startX } = e;
    const initialWidth = this.state.artistsPanelWidth;
    this._onMouseMove((moveEvent: MouseEvent) => {
      this.setState({
        artistsPanelWidth: initialWidth + moveEvent.pageX - startX
      });
    });
  };

  render() {
    const colors = this.props.skinGenExColors;
    return (
      <GenWindow title={"Winamp Library"} windowId={WINDOWS.MEDIA_LIBRARY}>
        {({ height, width }: { height: number; width: number }) => (
          <div
            id="webamp-media-library"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "row",
              overflow: "hidden"
            }}
          >
            {/*
            <div style={{ width: this.state.sidebarWidth }}>
              <Sidebar />
            </div>
          */}
            <div
              className="webamp-media-library-vertical-divider"
              onMouseDown={this._handleSidebarMouseDown}
            >
              <div className="webamp-media-library-vertical-divider-line" />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexShrink: 1,
                flexGrow: 1,
                // https://stackoverflow.com/a/35609992/1263117
                overflow: "hidden"
              }}
            >
              {/*
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexShrink: 0,
                  height: this.state.topPlaylistSectionHeight
                }}
              >
                <div style={{ width: this.state.artistsPanelWidth }}>
                  <ArtistsTable />
                </div>
                <div
                  className="webamp-media-library-vertical-divider"
                  onMouseDown={this._handleArtistsResizeMouseDown}
                >
                  <div className="webamp-media-library-vertical-divider-line" />
                </div>
                <AlbumsTable />
              </div>
              */}
              <div
                className="webamp-media-library-horizontal-divider"
                onMouseDown={this._handlePlaylistResizeMouseDown}
              >
                <div className="webamp-media-library-horizontal-divider-line" />
              </div>
              <TracksTable />
            </div>
          </div>
        )}
      </GenWindow>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    skinGenExColors: Selectors.getSkinGenExColors(state)
  };
};
export default connect(mapStateToProps)(MediaLibraryWindow);
