import React from "react";
import { findDOMNode } from "react-dom";

import {
  snapDiffManyToMany,
  boundingBox,
  snapWithinDiff,
  snap,
  traceConnection
} from "../snapUtils";

const WINDOW_HEIGHT = 116;
const WINDOW_WIDTH = 275;

const abuts = (a, b) => {
  const wouldMoveTo = snap(a, b);
  return wouldMoveTo.x !== undefined || wouldMoveTo.y !== undefined;
};

const applyDiff = (a, b) => ({
  x: a.x + b.x,
  y: a.y + b.y
});

class WindowManager extends React.Component {
  constructor(props) {
    super(props);
    this.windowNodes = [];
    this.state = {};
    this.getRef = this.getRef.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.centerWindows = this.centerWindows.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.centerWindows);
    const { innerHeight, innerWidth } = window;
    if (innerHeight || innerWidth) {
      this.centerWindows();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.centerWindows);
  }

  centerWindows() {
    const { innerHeight, innerWidth } = window;
    const state = {};
    const children = this.validChildren();
    const totalHeight = children.length * WINDOW_HEIGHT;
    children.forEach((child, i) => {
      const offset = WINDOW_HEIGHT * i;
      state[i] = {
        left: innerWidth / 2 - WINDOW_WIDTH / 2,
        top: innerHeight / 2 - totalHeight / 2 + offset
      };
    });
    this.setState(state);
  }

  getRef(node) {
    // If we are unmounting, the node might be null;
    if (node != null) {
      this.windowNodes.push(node);
    }
  }

  windows() {
    return this.windowNodes.map(findDOMNode);
  }

  otherWindows(element) {
    return this.windows.filter(node => node !== element);
  }

  nodeInfo(node, i) {
    const child = node.childNodes[0];
    const { height, width } = child.getBoundingClientRect();
    const { offsetLeft, offsetTop } = node;
    return {
      i,
      x: offsetLeft,
      y: offsetTop,
      height,
      width
    };
  }

  handleMouseDown(i, e) {
    if (!e.target.classList.contains("draggable")) {
      return;
    }
    // Prevent dragging from highlighting text.
    e.preventDefault();

    const mouseStart = {
      x: e.clientX,
      y: e.clientY
    };

    const targetNode = this.nodeInfo(e.currentTarget, i);

    const windows = this.windows(e.currentTarget).map(this.nodeInfo);

    let movingSet = new Set([targetNode]);

    // Only the main window brings other windows along.
    if (targetNode.i === 0) {
      const findAllConnected = traceConnection(abuts);
      movingSet = findAllConnected(windows, targetNode);
    }

    const stationary = windows.filter(w => !movingSet.has(w));
    const moving = Array.from(movingSet);

    const browserSize = {
      width: window.innerWidth,
      height: window.innerHeight
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

      let finalDiff = proposedDiff;
      if (withinDiff.x !== 0 || withinDiff.y !== 0) {
        finalDiff = applyDiff(proposedDiff, withinDiff);
      } else {
        finalDiff = applyDiff(proposedDiff, snapDiff);
      }

      const stateDiff = moving.reduce((diff, window) => {
        const newWindowLocation = applyDiff(window, finalDiff);
        diff[window.i] = {
          top: newWindowLocation.y,
          left: newWindowLocation.x
        };
        return diff;
      }, {});

      this.setState(stateDiff);
    };

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMove);
    });
    window.addEventListener("mousemove", handleMouseMove);
  }

  validChildren() {
    return React.Children.toArray(this.props.children).filter(child => child);
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
        {this.validChildren().map((child, i) => {
          const position = this.state[i];
          return (
            position && (
              <div
                onMouseDown={e => this.handleMouseDown(i, e)}
                ref={this.getRef}
                style={{ ...style, ...position }}
                key={i}
              >
                {child}
              </div>
            )
          );
        })}
      </div>
    );
  }
}
export default WindowManager;
