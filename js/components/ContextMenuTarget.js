import React from "react";
import PropTypes from "prop-types";
import ContextMenu from "./ContextMenu";

export default class ContextMenuTarget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
  }

  componentDidMount() {
    document.addEventListener("click", this._handleGlobalClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this._handleGlobalClick);
  }

  _handleHandleClick = () => {
    this.setState({ selected: !this.state.selected });
  };

  _handleGlobalClick = e => {
    if (
      this.state.selected &&
      // Not sure how, but it's possible for this to get called when handleNode is null/undefined.
      // https://sentry.io/share/issue/2066cd79f21e4f279791319f4d2ea35d/
      this.handleNode &&
      !this.handleNode.contains(e.target)
    ) {
      this.setState({ selected: false });
    }
  };

  _offset() {
    if (!this.handleNode) {
      return { top: 0, left: 0 };
    }

    const rect = this.handleNode.getBoundingClientRect();
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }

  render() {
    const { handle, children, top, bottom, ...passThroughProps } = this.props;
    const offset = this._offset();
    return (
      <div {...passThroughProps}>
        <div
          className="handle"
          style={{ width: "100%", height: "100%" }}
          ref={node => (this.handleNode = node)}
          onClick={this._handleHandleClick}
        >
          {handle}
        </div>
        <ContextMenu
          selected={this.state.selected}
          offsetTop={offset.top}
          offsetLeft={offset.left}
          top={top}
          bottom={bottom}
        >
          {children}
        </ContextMenu>
      </div>
    );
  }
}

ContextMenuTarget.propTypes = {
  children: PropTypes.any.isRequired,
  handle: PropTypes.any.isRequired,
  top: PropTypes.bool,
  bottom: PropTypes.bool
};
