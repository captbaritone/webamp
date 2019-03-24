import React, { ReactNode } from "react";
import { connect } from "react-redux";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import { AppState, SkinGenExColors } from "../../types";
import * as Selectors from "../../selectors";

interface StateProps {
  skinGenExColors: SkinGenExColors;
}

interface OwnProps {
  sidebar: ReactNode;
  artists: ReactNode;
  albums: ReactNode;
  tracks: ReactNode;
}

type Props = StateProps & OwnProps;

interface State {
  sidebarWidth: number;
  topPlaylistSectionHeight: number;
  artistsPanelWidth: number;
}

const DIVIDER_WIDTH = 9;
// TODO: Tune these
const SIDEBAR_MIN = 25;
const SIDEBAR_MAX = 200;

class LibraryLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sidebarWidth: 100, // Pixels
      topPlaylistSectionHeight: 0.25, // Percent
      artistsPanelWidth: 0.5, // Percent
    };
  }

  _onMouseMove(cb: (e: MouseEvent) => void) {
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", cb);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // TODO: Technically there's a leak here since the component could unmount while we are moving
    document.addEventListener("mousemove", cb);
    document.addEventListener("mouseup", handleMouseUp);
  }

  _handleSidebarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageX: startX } = e;
    const initialWidth = this.state.sidebarWidth;
    this._onMouseMove((moveEvent: MouseEvent) => {
      let sidebarWidth = initialWidth + moveEvent.pageX - startX;
      if (sidebarWidth < SIDEBAR_MIN) {
        sidebarWidth = 0;
      }
      sidebarWidth = Math.min(sidebarWidth, SIDEBAR_MAX);

      this.setState({ sidebarWidth });
    });
  };

  _handlePlaylistResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    windowHeight: number
  ) => {
    const { pageY: startY } = e;
    const avaliableHeight = windowHeight - DIVIDER_WIDTH;
    const initialHeight = avaliableHeight * this.state.topPlaylistSectionHeight;

    this._onMouseMove((moveEvent: MouseEvent) => {
      const deltaY = moveEvent.pageY - startY;
      const topPlaylistSectionPixelHeight = initialHeight + deltaY;
      this.setState({
        topPlaylistSectionHeight:
          topPlaylistSectionPixelHeight / avaliableHeight,
      });
    });
  };

  _handleArtistsResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    windowWidth: number
  ) => {
    const { pageX: startX } = e;
    const avaliableWidth =
      windowWidth - DIVIDER_WIDTH - this.state.sidebarWidth;
    const initialWidth = avaliableWidth * this.state.artistsPanelWidth;

    this._onMouseMove((moveEvent: MouseEvent) => {
      const deltaX = moveEvent.pageX - startX;
      const artistsPanelPixelWidth = initialWidth + deltaX;
      this.setState({
        artistsPanelWidth: artistsPanelPixelWidth / avaliableWidth,
      });
    });
  };

  render() {
    return (
      <GenWindow title={"Winamp Library"} windowId={WINDOWS.MEDIA_LIBRARY}>
        {({ width, height }) => (
          <div
            id="webamp-media-library"
            style={{
              // TODO: There's probably a better way to fill all avalaible space.
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "grid",
              gridTemplateColumns: `${
                this.state.sidebarWidth
              }px ${DIVIDER_WIDTH}px auto`,
            }}
          >
            {this.state.sidebarWidth === 0 ? <div /> : this.props.sidebar}
            <div
              className="webamp-media-library-vertical-divider"
              onMouseDown={this._handleSidebarMouseDown}
            >
              <div className="webamp-media-library-vertical-divider-line" />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateRows: `${
                  this.state.topPlaylistSectionHeight
                }fr ${DIVIDER_WIDTH}px ${1 -
                  this.state.topPlaylistSectionHeight}fr`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `${
                    this.state.artistsPanelWidth
                  }fr ${DIVIDER_WIDTH}px ${1 - this.state.artistsPanelWidth}fr`,
                }}
              >
                {this.props.artists}
                <div
                  className="webamp-media-library-vertical-divider"
                  onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
                    this._handleArtistsResizeMouseDown(e, width)
                  }
                >
                  <div className="webamp-media-library-vertical-divider-line" />
                </div>
                {this.props.albums}
              </div>
              <div
                className="webamp-media-library-horizontal-divider"
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
                  this._handlePlaylistResizeMouseDown(e, height)
                }
              >
                <div className="webamp-media-library-horizontal-divider-line" />
              </div>
              <div style={{ overflow: "hidden" }}>{this.props.tracks}</div>
            </div>
          </div>
        )}
      </GenWindow>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    skinGenExColors: Selectors.getSkinGenExColors(state),
  };
};
export default connect(mapStateToProps)(LibraryLayout);
