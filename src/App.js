import React from "react";
import skins from "./skins.json";
import "./App.css";

const hashes = Object.keys(skins);

const SCALE = 1 / 2;
const SKIN_WIDTH = 275 * SCALE;
const SKIN_HEIGHT = 348 * SCALE;
const SKIN_RATIO = SKIN_HEIGHT / SKIN_WIDTH;

class Skin extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
    this._handleLoad = this._handleLoad.bind(this);
  }

  _handleLoad() {
    this.setState({ loaded: true });
  }

  render() {
    return (
      <div
        className={"skin"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: this.props.color,
          width: this.props.width,
          height: this.props.height,
          transform: `translate3d(${this.props.left}px, ${
            this.props.top
          }px, 0px)`
        }}
      >
        <a href={this.props.href} target="_blank">
          <img
            src={this.props.src}
            className={`screenshot ${this.state.loaded ? "loaded" : ""}`}
            onLoad={this._handleLoad}
          />
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
    const newScrollTop = getScrollTop();
    this.setState({
      scrollTop: newScrollTop,
      scrollDirection: newScrollTop > this.state.scrollTop ? "DOWN" : "UP"
    });
  }

  render() {
    const columnCount = Math.floor(this.state.windowWidth / SKIN_WIDTH);
    const columnWidth = this.state.windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
    const rowHeight = columnWidth * SKIN_RATIO;
    // Add one since we might be showing half a row at the top, and half a row at the bottom
    const visibleRows = Math.ceil(this.state.windowHeight / rowHeight) + 1;

    const topRow = Math.floor(this.state.scrollTop / rowHeight);

    // TODO: Add overscan
    const firstHashToRender = topRow * columnCount;
    const lastHashToRender = firstHashToRender + visibleRows * columnCount;

    const skinElements = [];
    for (let i = firstHashToRender; i <= lastHashToRender; i++) {
      const hash = hashes[i];
      const row = Math.floor(i / columnCount);
      const top = row * rowHeight;
      const column = i % columnCount;
      const left = column * columnWidth;
      skinElements.push(
        <Skin
          href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
          src={`https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${hash}.png`}
          key={hash}
          top={top}
          left={left}
          width={columnWidth}
          height={rowHeight}
          color={skins[hash].color}
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
