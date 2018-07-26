import React from "react";
import { List, WindowScroller } from "react-virtualized";
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
        style={{
          backgroundColor: this.props.color,
          width: this.props.width,
          height: "100%",
          display: "inline-block"
        }}
      >
        <a href={this.props.href} target="_blank">
          {(this.state.loaded || !this.props.isScrolling) && (
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

// Render your table

class App extends React.Component {
  constructor() {
    super();
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  _rowRenderer({
    index,
    key,
    style,
    columnCount,
    columnWidth,
    rowHeight,
    isScrolling,
    isVisible
  }) {
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const hash = hashes[index * columnCount + i];
      columns.push(
        <Skin
          key={hash}
          src={`https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${hash}.png`}
          width={columnWidth}
          height={rowHeight}
          color={skins[hash].color}
          isScrolling={isScrolling}
          isVisible={isVisible}
          href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
        />
      );
    }

    return (
      <div key={key} style={style} className="screenshot-container">
        {columns}
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <WindowScroller>
          {({ height, width, isScrolling, onChildScroll, scrollTop }) => {
            const columnCount = Math.floor(width / SKIN_WIDTH);
            const columnWidth = width / columnCount;
            const rowHeight = columnWidth * SKIN_RATIO;

            return (
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                overscanRowCount={10}
                rowCount={hashes.length / columnCount}
                rowHeight={rowHeight}
                rowRenderer={props =>
                  this._rowRenderer({
                    ...props,
                    width,
                    columnCount,
                    columnWidth,
                    rowHeight
                  })
                }
                scrollTop={scrollTop}
                width={width}
              />
            );
          }}
        </WindowScroller>
      </div>
    );
  }
}

export default App;
