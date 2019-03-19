import React, { ReactNode } from "react";
import ContextMenu from "./ContextMenu";

interface Props {
  renderContents(): ReactNode;
}

interface State {
  selected: boolean;
  offsetTop: number | null;
  offsetLeft: number | null;
}

export default class ContextMenuWraper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: false,
      offsetTop: null,
      offsetLeft: null,
    };
  }

  componentWillUnmount() {
    this._closeMenu();
  }

  _closeMenu() {
    this.setState({ selected: false, offsetTop: null, offsetLeft: null });
    document.removeEventListener("click", this._handleGlobalClick);
    document.body.removeEventListener(
      "contextmenu",
      this._handleGlobalRightClick
    );
  }

  _handleGlobalRightClick = () => {
    this._closeMenu();
  };

  _handleGlobalClick = (e: MouseEvent) => {
    if (e.button === 2) {
      return;
    }
    this._closeMenu();
  };

  _handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageX, pageY } = e;
    this.setState({
      selected: true,
      // TODO: We could do an initial render to see if the menu fits here
      // and do a second render if it does not.
      offsetTop: pageY,
      offsetLeft: pageX,
    });
    // Even if you right click multiple times before closeing,
    // we should only end up with one global listener.
    document.addEventListener("click", this._handleGlobalClick);
    document.body.addEventListener("contextmenu", this._handleGlobalRightClick);
    e.preventDefault();
    e.stopPropagation();
  };

  render() {
    const { children, renderContents, ...passThroughProps } = this.props;
    return (
      <div
        onContextMenu={this._handleRightClick}
        style={{ width: "100%", height: "100%" }}
        {...passThroughProps}
      >
        <ContextMenu
          selected={this.state.selected}
          offsetTop={this.state.offsetTop || 0}
          offsetLeft={this.state.offsetLeft || 0}
        >
          {renderContents()}
        </ContextMenu>
        {children}
      </div>
    );
  }
}
