import React from "react";
import { List, WindowScroller } from "react-virtualized";
import skins from "./skins.json";
import Featured from "./Featured";
import "./App.css";

const SKIN_WIDTH = 275;
const SKIN_HEIGHT = 348;
const SKIN_RATIO = SKIN_HEIGHT / SKIN_WIDTH;

const Img = props => <Img {...props} />;

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
        onClick={this.props.setFocused}
      >
        <img
          src={this.props.src}
          className={`screenshot`}
          onLoad={this._handleLoad}
          style={{
            visibility: this.state.loaded ? "inherit" : "hidden"
          }}
        />
      </div>
    );
  }
}

// Render your table

class App extends React.Component {
  constructor() {
    super();
    this.state = { focused: null };
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  _rowRenderer({
    index,
    key,
    style,
    columnCount,
    columnWidth,
    isScrolling,
    isVisible
  }) {
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const skin = skins[index * columnCount + i];
      columns.push(
        <Skin
          key={skin.file}
          src={`${process.env.PUBLIC_URL}/screenshots/${skin.file}`}
          width={columnWidth}
          color={skin.color}
          isScrolling={isScrolling}
          isVisible={isVisible}
          faded={this.state.focused != null && this.state.focused !== skin.file}
          setFocused={() =>
            this.setState({
              focused: this.state.focused === skin.file ? null : skin.file
            })
          }
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
                rowCount={skins.length / columnCount}
                rowHeight={rowHeight}
                rowRenderer={props =>
                  this._rowRenderer({
                    ...props,
                    width,
                    columnCount,
                    columnWidth
                  })
                }
                scrollTop={scrollTop}
                width={width}
              />
            );
          }}
        </WindowScroller>
        {this.state.focused && (
          <Featured
            skinUrl={`${process.env.PUBLIC_URL}/screenshots/${
              this.state.focused
            }`}
            dismiss={() => this.setState({ focused: null })}
          />
        )}
      </div>
    );
  }
}

export default App;
