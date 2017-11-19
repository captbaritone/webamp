import React from "react";
import classnames from "classnames";

let cursorX;
let cursorY;
window.document.addEventListener("mousemove", e => {
  cursorX = e.pageX;
  cursorY = e.pageY;
});

// We implement hover ourselves, because we hate ourselves and https://stackoverflow.com/a/13259049/1263117
class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: false };
  }

  componentDidMount() {
    const domRect = this.node.getBoundingClientRect();
    this.setState({
      hover:
        cursorX >= domRect.left &&
        cursorX <= domRect.right &&
        cursorY >= domRect.top &&
        cursorY <= domRect.bottom
    });
  }

  render() {
    return (
      <li
        ref={node => (this.node = node)}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        className={classnames({ hover: this.state.hover })}
      >
        {this.props.children}
      </li>
    );
  }
}

export default class PlaylistMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
    this._handleClick = this._handleClick.bind(this);
  }

  _handleClick(e) {
    const { target } = e;
    const { selected } = this.state;
    if (selected) {
      this.setState({ selected: false });
      return;
    }

    const handleClickOut = ee => {
      // If the click is _not_ inside the menu.
      if (!target.contains(ee.target)) {
        // If we've clicked on a Context Menu spawed inside this menu, it will
        // register as an external click. However, hiding the menu will remove
        // the Context Menu from the DOM. Therefore, we wait until the next
        // event loop to actually hide ourselves.
        setTimeout(() => {
          // Close the menu
          this.setState({ selected: false });
        }, 0);
        window.document.removeEventListener("click", handleClickOut, {
          capture: true
        });
      }
    };
    window.document.addEventListener("click", handleClickOut, {
      capture: true
    });

    this.setState({ selected: true });
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
        {this.state.selected && (
          <ul>
            {React.Children.map(this.props.children, (child, i) => (
              <Entry key={i}>{child}</Entry>
            ))}
          </ul>
        )}
      </div>
    );
  }
}
