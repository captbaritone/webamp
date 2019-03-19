import React from "react";
import classnames from "classnames";

import PlaylistMenuEnry from "./PlaylistMenuEntry";

interface Props {
  id: string;
}

interface State {
  selected: boolean;
}

export default class PlaylistMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { selected: false };
  }

  _handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { target } = e;
    if (!(target instanceof Element)) {
      // TypeScript doesn't realize this will always be true
      return;
    }
    const { selected } = this.state;
    if (selected) {
      this.setState({ selected: false });
      return;
    }

    const handleClickOut = (ee: MouseEvent) => {
      const clickOutTarget = ee.target;
      if (!(clickOutTarget instanceof Element)) {
        // TypeScript doesn't realize this will always be true
        return;
      }
      // If the click is _not_ inside the menu.
      if (!target.contains(clickOutTarget)) {
        // If we've clicked on a Context Menu spawed inside this menu, it will
        // register as an external click. However, hiding the menu will remove
        // the Context Menu from the DOM. Therefore, we wait until the next
        // event loop to actually hide ourselves.
        setTimeout(() => {
          // Close the menu
          this.setState({ selected: false });
        }, 0);
        window.document.removeEventListener("click", handleClickOut, {
          capture: true,
        });
      }
    };
    window.document.addEventListener("click", handleClickOut, {
      capture: true,
    });

    this.setState({ selected: true });
  };

  render() {
    return (
      <div
        id={this.props.id}
        className={classnames("playlist-menu", {
          selected: this.state.selected,
        })}
        onClick={this._handleClick}
      >
        <div className="bar" />
        {this.state.selected && (
          <ul>
            {React.Children.map(this.props.children, (child, i) => (
              <PlaylistMenuEnry key={i}>{child}</PlaylistMenuEnry>
            ))}
          </ul>
        )}
      </div>
    );
  }
}
