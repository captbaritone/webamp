import React from "react";
import skins from "./skins.json";
import "./App.css";
import LoadQueue from "./LoadQueue";

const hashes = Object.keys(skins);

const SCALE = 1 / 2;
const SKIN_WIDTH = 275 * SCALE;
const SKIN_HEIGHT = 348 * SCALE;
const SKIN_RATIO = SKIN_HEIGHT / SKIN_WIDTH;
const OVERSCAN_ROWS_LEADING = 10;
const OVERSCAN_ROWS_TRAILING = 4;

class Skin extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false, load: false, enqueuedAs: null };
    this._controller = new window.AbortController();
    this._handleLoad = this._handleLoad.bind(this);
  }

  _getPriority() {
    return this.props.isOverscan ? 1 : 0;
  }

  componentDidUpdate(prevProps) {
    if (this._queued && !(this.state.load || this.state.loaded)) {
      this._queued.changePriority(this._getPriority());
      if (this.state.enqueuedAs !== this._getPriority()) {
        this.setState({ enqueuedAs: this._getPriority() });
      }
    }
  }

  componentDidMount() {
    this._queued = this.props.queue.enqueue(() => {
      const signal = this._controller.signal;
      return fetch(this.props.src, { signal, mode: "no-cors" })
        .then(() => {
          this.setState({ load: true });
        })
        .catch(e => {});
    }, this._getPriority());
    this.setState({ enqueuedAs: this._getPriority() });
  }

  _handleLoad() {
    this.setState({ loaded: true });
  }

  componentWillUnmount() {
    if (!this.state.loaded) {
      this._controller.abort();
    }
    if (this._queued != null) {
      this._queued.dispose();
      this._queued = null;
    }
  }

  render() {
    return (
      <div
        className={"skin"}
        style={{
          position: "absolute",
          // Ideally the final backgroundColor would be black
          // But that makes our opacitly transition kinda funky
          backgroundColor: this.props.color,
          width: this.props.width,
          height: this.props.height,
          top: this.props.top,
          left: this.props.left
        }}
      >
        <div className="priority">
          {this.state.enqueuedAs} -{" "}
          {this.state.load && !this.state.loaded ? "loading..." : ""}
        </div>
        <a href={this.props.href} target="_blank">
          {this.state.load && (
            <img
              src={this.props.src}
              className={`screenshot ${this.state.loaded ? "loaded" : ""}`}
              onLoad={this._handleLoad}
            />
          )}
        </a>
      </div>
    );
  }
}

function getWindowSize() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return {
    windowWidth: x,
    windowHeight: y
  };
}

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop;
}
// Render your table

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      ...getWindowSize(),
      scrollTop: getScrollTop(),
      scrollDirection: null
    };
    this._handleScroll();
    this._queue = new LoadQueue(10);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = this._handleResize.bind(this);
  }

  _handleResize() {
    // TODO: Try to recompute the scroll position
    this.setState(getWindowSize());
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
          queue={this._queue}
          href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
          src={`https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${hash}.png`}
          key={hash}
          top={top}
          left={left}
          width={columnWidth}
          height={rowHeight}
          color={skins[hash].color}
          isOverscan={isOverscan}
        />
      );
    }
    return (
      <div
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

export default App;
