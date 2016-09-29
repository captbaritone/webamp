import React from 'react';
import {findDOMNode} from 'react-dom';

import {snapToMany, snapWithin, applySnap} from '../snapUtils';

const WINDOW_HEIGHT = 116;
const WINDOW_WIDTH = 275;

class WindowManager extends React.Component {
  constructor(props) {
    super(props);
    const state = {};
    this.validChildren().forEach((child, i) => {
      state[i] = {
        x: -(WINDOW_WIDTH / 2),
        y: 0
      };
    });
    this.state = state;
    this.windowNodes = [];
    this.getRef = this.getRef.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  getRef(node) {
    this.windowNodes.push(node);
  }

  otherWindows(element) {
    const domNodes = this.windowNodes.map(findDOMNode);
    return domNodes.filter((node) => node !== element);
  }

  nodeInfo(node) {
    const child = node.childNodes[0];
    const {height, width} = child.getBoundingClientRect();
    const {offsetLeft, offsetTop} = node;
    return {
      x: offsetLeft,
      y: offsetTop,
      height,
      width
    };
  }

  handleMouseDown(i, e) {
    const mouseStart = {
      x: e.clientX,
      y: e.clientY
    };

    const windowStart = this.nodeInfo(e.currentTarget);

    const otherWindowNodes = this.otherWindows(e.currentTarget).map(this.nodeInfo);

    const browserSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const handleMouseMove = (ee) => {
      const diff = {
        x: ee.clientX - mouseStart.x,
        y: ee.clientY - mouseStart.y
      };

      const proposedWindow = {
        ...windowStart,
        x: windowStart.x + diff.x,
        y: windowStart.y + diff.y
      };

      const snappedToOthers = snapToMany(proposedWindow, otherWindowNodes);
      const snappedToBrowser = snapWithin(proposedWindow, browserSize);

      const newPosition = applySnap(proposedWindow, snappedToBrowser, snappedToOthers);

      this.setState({[i]: {top: newPosition.y, left: newPosition.x}});
    };

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', handleMouseMove);
    });
    window.addEventListener('mousemove', handleMouseMove);
  }

  validChildren() {
    return React.Children.toArray(this.props.children).filter((child) => child);
  }

  render() {
    const style = {
      position: 'absolute'
    };

    const parentStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      top: '50vh',
      left: '50vw'
    };
    return (
      <div style={parentStyle}>
        {this.validChildren().map((child, i) => {
          const position = this.state[i] || {};
          /* eslint-disable react/jsx-no-bind */
          return (
            <div
              onMouseDown={(e) => this.handleMouseDown(i, e)}
              ref={this.getRef}
              style={{...style, ...position}}
              key={i}
            >
              {child}
            </div>
          );
          /* eslint-enable react/jsx-no-bind */
        })}
      </div>
    );
  }
}
module.exports = WindowManager;
