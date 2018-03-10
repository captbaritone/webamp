import React from "react";
import PropTypes from "prop-types";

import {
  snapDiffManyToMany,
  boundingBox,
  snapWithinDiff,
  snap,
  traceConnection,
  applyDiff,
  applyMultipleDiffs
} from "../snapUtils";

const WINDOW_HEIGHT = 116;
const WINDOW_WIDTH = 275;

const abuts = (a, b) => {
  // TODO: This is kinda a hack. They should really be touching, not just within snapping distance.
  // Also, overlapping should not count.
  const wouldMoveTo = snap(a, b);
  return wouldMoveTo.x !== undefined || wouldMoveTo.y !== undefined;
};

class WindowManager extends React.Component {
  constructor(props) {
    super(props);
    this.windowNodes = {};
    this.state = {};
    this.getRef = this.getRef.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.centerWindows = this.centerWindows.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.centerWindows);
    this.centerWindows();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.centerWindows);
  }

  centerWindows() {
    let offsetLeft = 0;
    let offsetTop = 0;
    // https://j11y.io/snippets/get-document-height-cross-browser/
    let width = Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
      document.documentElement.offsetWidth
    );
    let height = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
      document.documentElement.offsetHeight
    );

    const { container } = this.props;
    if (container != null) {
      offsetLeft = container.offsetLeft;
      offsetTop = container.offsetTop;
      width = container.scrollWidth;
      height = container.scrollHeight;
    }
    const state = {};
    const keys = this.windowKeys();
    const totalHeight = keys.length * WINDOW_HEIGHT;
    keys.forEach((key, i) => {
      const offset = WINDOW_HEIGHT * i;
      state[key] = {
        left: offsetLeft + (width / 2 - WINDOW_WIDTH / 2),
        top: offsetTop + (height / 2 - totalHeight / 2 + offset)
      };
    });
    this.setState(state);
  }

  getRef(key, node) {
    // If we are unmounting, the node might be null;
    this.windowNodes[key] = node;
  }

  //
  getWindowNodes() {
    return this.windowKeys()
      .map(key => {
        const node = this.windowNodes[key];
        return node && this.nodeInfo(node, key);
      })

      .filter(Boolean);
  }

  nodeInfo(node, key) {
    const child = node.childNodes[0];
    const { height, width } = child.getBoundingClientRect();
    const { offsetLeft, offsetTop } = node;
    return { key, x: offsetLeft, y: offsetTop, height, width };
  }

  movingAndStationaryNodes(key) {
    const windows = this.getWindowNodes();
    const targetNode = windows.find(node => node.key === key);

    let movingSet = new Set([targetNode]);
    // Only the main window brings other windows along.
    if (key === "main") {
      const findAllConnected = traceConnection(abuts);
      movingSet = findAllConnected(windows, targetNode);
    }

    const stationary = windows.filter(w => !movingSet.has(w));
    const moving = Array.from(movingSet);

    return [moving, stationary];
  }

  handleMouseDown(key, e) {
    if (!e.target.classList.contains("draggable")) {
      return;
    }
    // Prevent dragging from highlighting text.
    e.preventDefault();

    const [moving, stationary] = this.movingAndStationaryNodes(key);

    const mouseStart = { x: e.clientX, y: e.clientY };
    const browserSize = {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    };

    const box = boundingBox(moving);

    const handleMouseMove = ee => {
      const proposedDiff = {
        x: ee.clientX - mouseStart.x,
        y: ee.clientY - mouseStart.y
      };

      const proposedWindows = moving.map(node => ({
        ...node,
        ...applyDiff(node, proposedDiff)
      }));

      const proposedBox = {
        ...box,
        ...applyDiff(box, proposedDiff)
      };

      const snapDiff = snapDiffManyToMany(proposedWindows, stationary);

      const withinDiff = snapWithinDiff(proposedBox, browserSize);

      const finalDiff = applyMultipleDiffs(proposedDiff, snapDiff, withinDiff);

      const stateDiff = moving.reduce((diff, window) => {
        const newWindowLocation = applyDiff(window, finalDiff);
        diff[window.key] = {
          top: newWindowLocation.y,
          left: newWindowLocation.x
        };
        return diff;
      }, {});

      this.setState(stateDiff);
    };

    const removeListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", removeListeners);
    };

    window.addEventListener("mouseup", removeListeners);
    window.addEventListener("mousemove", handleMouseMove);
  }

  // Keys for the visible windows
  windowKeys() {
    // TODO: Iterables can probably do this better.
    return Object.keys(this.props.windows).filter(
      key => !!this.props.windows[key]
    );
  }

  render() {
    const style = {
      position: "absolute"
    };

    const parentStyle = {
      position: "absolute",
      width: 0,
      height: 0,
      top: 0,
      left: 0
    };
    return (
      <div style={parentStyle}>
        {this.windowKeys().map(key => {
          const position = this.state[key];
          return (
            position && (
              <div
                onMouseDown={e => this.handleMouseDown(key, e)}
                ref={node => this.getRef(key, node)}
                style={{ ...style, ...position }}
                key={key}
              >
                {this.props.windows[key]}
              </div>
            )
          );
        })}
      </div>
    );
  }
}

WindowManager.propTypes = {
  windows: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element)
};

export default WindowManager;
