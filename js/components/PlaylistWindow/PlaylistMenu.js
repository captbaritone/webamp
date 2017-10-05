import React from "react";
import classnames from "classnames";

export default class PlaylistMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
    this._handleClick = this._handleClick.bind(this);
  }

  _handleClick(e) {
    const { target } = e;
    this.setState({ selected: !this.state.selected });
    const handleClickOut = ee => {
      if (!target.contains(ee.target)) {
        this.setState({ selected: false });
        ee.stopPropagation();
      }
      window.document.removeEventListener("click", handleClickOut, {
        capture: true
      });
    };
    window.document.addEventListener("click", handleClickOut, {
      capture: true
    });
  }

  render() {
    return (
      <div
        id={this.props.id}
        className={classnames("playlist-menu", {
          selected: this.state.selected
        })}
        onClick={this._handleClick}
      >
        <div className="bar" />
        <ul>{this.props.children}</ul>
      </div>
    );
  }
}
