import React from "react";
import skins from "./skins.json";
import "./App.css";
import { connect } from "react-redux";
import Skin from "./Skin";
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

class SkinTable extends React.Component {
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
    const { rowHeight, columnWidth } = this._getTableDimensions();
    this.props.setCellSize({ rowHeight, columnWidth });
  }

  componentDidMount() {
    window.addEventListener("scroll", this._handleScroll);
    window.addEventListener("resize", this._handleResize);
    const { rowHeight, columnWidth } = this._getTableDimensions();
    this.props.setCellSize({ rowHeight, columnWidth });
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

  _getTableDimensions() {
    const columnCount = Math.floor(this.state.windowWidth / SKIN_WIDTH);
    const columnWidth = this.state.windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
    const rowHeight = columnWidth * SKIN_RATIO;
    return { columnWidth, rowHeight, columnCount };
  }

  render() {
    const { columnWidth, rowHeight, columnCount } = this._getTableDimensions();
    const hashes = this.props.skinHashes;
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
      <div
        id="infinite-skins"
        style={{
          height: Math.ceil(hashes.length / columnCount) * SKIN_HEIGHT,
          position: "relative"
        }}
      >
        {skinElements}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  skinHashes: Selectors.getMatchingSkinHashes(state)
});

const mapDispatchToProps = dispatch => ({
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SkinTable);
