import React from "react";
import PropTypes from "prop-types";
import { ContextMenu } from "./ContextMenu";

export default class ContextMenuWraper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
      offsetTop: null,
      offsetLeft: null
    };
    this._handleRightClick = this._handleRightClick.bind(this);
    this._handleGlobalClick = this._handleGlobalClick.bind(this);
  }

  _handleGlobalClick() {
    this.setState({
      selected: false,
      offsetTop: null,
      offsetLeft: null
    });
    document.removeEventListener("click", this._handleGlobalClick);
  }

  _handleRightClick(e) {
    const { pageX, pageY } = e;
    this.setState({
      selected: true,
      offsetTop: pageY,
      offsetLeft: pageX
    });
    // Even if you right click multiple times before closeing,
    // we should only end up with one global listener.
    document.addEventListener("click", this._handleGlobalClick);
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const { children, Contents, ...passThroughProps } = this.props;
    return (
      <div
        onContextMenu={this._handleRightClick}
        style={{ width: "100%", height: "100%" }}
        {...passThroughProps}
      >
        <ContextMenu
          selected={this.state.selected}
          offsetTop={this.state.offsetTop}
          offsetLeft={this.state.offsetLeft}
        >
          <Contents />
        </ContextMenu>
        {children}
      </div>
    );
  }
}

ContextMenuWraper.propTypes = {
  children: PropTypes.any.isRequired,
  Contents: PropTypes.any.isRequired
};
