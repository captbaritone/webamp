import React from "react";
import skins from "./skins.json";
import "./App.css";
import { connect } from "react-redux";
import Overlay from "./Overlay";
import Skin from "./Skin";
import FocusedSkin from "./FocusedSkin";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { SKIN_WIDTH, SKIN_HEIGHT, SKIN_RATIO } from "./constants";

const OVERSCAN_ROWS_LEADING = 10;
const OVERSCAN_ROWS_TRAILING = 4;

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop;
}
// Render your table

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      ...Utils.getWindowSize(),
      scrollTop: getScrollTop(),
      scrollDirection: null,
      selectedSkinPosition: null
    };
    this._handleScroll();
    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleSelectSkin = this._handleSelectSkin.bind(this);
  }

  _handleSelectSkin(hash, position) {
    this.props.setSelectedSkin(hash, position);
  }

  _handleResize() {
    // TODO: Try to recompute the scroll position
    this.setState(Utils.getWindowSize());
  }

  componentDidMount() {
    window.addEventListener("scroll", this._handleScroll);
    window.addEventListener("resize", this._handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this._handleScroll);
    window.removeEventListener("resize", this._handleResize);
  }

  _handleScroll() {
    // If there's a timer, cancel it
    if (this._timeout) {
      window.cancelAnimationFrame(this._timeout);
    }

    this._timeout = window.requestAnimationFrame(() => {
      // Run our scroll functions
      const newScrollTop = getScrollTop();
      this.setState({
        scrollTop: newScrollTop,
        scrollDirection: newScrollTop > this.state.scrollTop ? "DOWN" : "UP"
      });
    });
  }

  render() {
    const hashes = this.props.skinHashes;
    const columnCount = Math.floor(this.state.windowWidth / SKIN_WIDTH);
    const columnWidth = this.state.windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
    const rowHeight = columnWidth * SKIN_RATIO;
    // Add one since we might be showing half a row at the top, and half a row at the bottom
    const visibleRows = Math.ceil(this.state.windowHeight / rowHeight) + 1;

    const topRow = Math.floor(this.state.scrollTop / rowHeight);

    const overscanRowsDown =
      this.state.scrollDirection === "DOWN"
        ? OVERSCAN_ROWS_LEADING
        : OVERSCAN_ROWS_TRAILING;
    const overscanRowsUp =
      this.state.scrollDirection === "UP"
        ? OVERSCAN_ROWS_LEADING
        : OVERSCAN_ROWS_TRAILING;

    const firstHashToRender = topRow * columnCount;
    const lastHashToRender = Math.min(
      firstHashToRender + visibleRows * columnCount,
      hashes.length
    );

    const firstOverscanHashToRender = Math.max(
      firstHashToRender - overscanRowsUp * columnCount,
      0
    );
    const lastOverscanHashToRender = Math.min(
      lastHashToRender + overscanRowsDown * columnCount,
      hashes.length
    );

    const skinElements = [];
    for (let i = firstOverscanHashToRender; i < lastOverscanHashToRender; i++) {
      const isOverscan = i < firstHashToRender || i > lastHashToRender;
      const hash = hashes[i];
      const row = Math.floor(i / columnCount);
      const top = row * rowHeight;
      const column = i % columnCount;
      const left = column * columnWidth;
      skinElements.push(
        <Skin
          href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
          src={Utils.screenshotUrlFromHash(hash)}
          key={hash}
          hash={hash}
          top={top}
          left={left}
          width={columnWidth}
          height={rowHeight}
          color={skins[hash].color}
          isOverscan={isOverscan}
          selectSkin={this._handleSelectSkin}
        />
      );
    }
    return (
      <div>
        <div id="search">
          <h1>
            <a
              href="/"
              onClick={e => {
                if (Utils.eventIsLinkClick(e)) {
                  e.preventDefault();
                  this.props.setSearchQuery(null);
                }
              }}
            >
              <span id="logo">{"🌩️"}</span>
              <span className="name">Winamp Skin Museum</span>
            </a>
          </h1>
          <input
            type="text"
            onChange={e => this.props.setSearchQuery(e.target.value)}
            value={this.props.searchQuery || ""}
            placeholder={"Search..."}
          />
          <span style={{ flexGrow: 1 }} />
          <button
            onClick={() => {
              this.props.requestRandomSkin();
            }}
          >
            Random
          </button>
        </div>
        <div
          id="infinite-skins"
          style={{
            height: Math.ceil(hashes.length / columnCount) * SKIN_HEIGHT,
            position: "relative"
          }}
        >
          {skinElements}
        </div>
        {this.props.selectedSkinHash == null || (
          <Overlay>
            <FocusedSkin initialHeight={rowHeight} initialWidth={columnWidth} />
          </Overlay>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  searchQuery: Selectors.getSearchQuery(state),
  skinHashes: Selectors.getMatchingSkinHashes(state)
});

const mapDispatchToProps = dispatch => ({
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  },
  setSearchQuery(query) {
    dispatch(Actions.searchQueryChanged(query));
  },
  requestRandomSkin() {
    dispatch(Actions.requestedRandomSkin());
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
