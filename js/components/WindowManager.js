import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  snapDiffManyToMany,
  boundingBox,
  snapWithinDiff,
  snap,
  traceConnection,
  applyDiff,
  applyMultipleDiffs
} from "../snapUtils";
import { getWindowsInfo } from "../selectors";
import { updateWindowPositions } from "../actionCreators";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";
import { calculateBoundingBox } from "../utils";

const abuts = (a, b) => {
  // TODO: This is kinda a hack. They should really be touching, not just within snapping distance.
  // Also, overlapping should not count.
  const wouldMoveTo = snap(a, b);
  return wouldMoveTo.x !== undefined || wouldMoveTo.y !== undefined;
};

class WindowManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.centerWindows = this.centerWindows.bind(this);
  }

  componentDidMount() {
    this.centerWindows();
  }

  centerWindows() {
    const { container } = this.props;

    const offsetLeft = container.offsetLeft;
    const offsetTop = container.offsetTop;
    const width = container.scrollWidth;
    const height = container.scrollHeight;

    if (this.props.windowsInfo.some(w => w.x == null || w.y == null)) {
      // Some windows do not have an initial position, so we'll come up
      // with your own layout.
      const windowPositions = {};
      const keys = this.windowKeys();
      const totalHeight = keys.length * WINDOW_HEIGHT;
      const globalOffsetLeft = Math.max(0, width / 2 - WINDOW_WIDTH / 2);
      const globalOffsetTop = Math.max(0, height / 2 - totalHeight / 2);
      keys.forEach((key, i) => {
        const offset = WINDOW_HEIGHT * i;
        windowPositions[key] = {
          x: Math.ceil(offsetLeft + globalOffsetLeft),
          y: Math.ceil(offsetTop + (globalOffsetTop + offset))
        };
      });
      this.props.updateWindowPositions(windowPositions);
    } else {
      // A layout has been suplied. We will compute the bounding box and
      // center the given layout.
      const info = this.props.windowsInfo;

      const bounding = calculateBoundingBox(info);

      const boxHeight = bounding.bottom - bounding.top;
      const boxWidth = bounding.right - bounding.left;

      const move = {
        x: offsetLeft + (width - boxWidth) / 2,
        y: offsetTop + (height - boxHeight) / 2
      };

      const newPositions = info.reduce(
        (pos, w) => ({ ...pos, [w.key]: { x: move.x + w.x, y: move.y + w.y } }),
        {}
      );

      this.props.updateWindowPositions(newPositions);
    }
  }

  movingAndStationaryNodes(key) {
    const windows = this.props.windowsInfo;
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

      const windowPositionDiff = moving.reduce((diff, window) => {
        diff[window.key] = applyDiff(window, finalDiff);
        return diff;
      }, {});

      this.props.updateWindowPositions(windowPositionDiff);
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
        {this.props.windowsInfo.map(w => (
          <div
            onMouseDown={e => this.handleMouseDown(w.key, e)}
            style={{ ...style, left: w.x, top: w.y }}
            key={w.key}
          >
            {this.props.windows[w.key]}
          </div>
        ))}
      </div>
    );
  }
}

WindowManager.propTypes = {
  windows: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired
};

const mapStateToProps = state => ({
  windowsInfo: getWindowsInfo(state)
});

const mapDispatchToProps = {
  updateWindowPositions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WindowManager);
