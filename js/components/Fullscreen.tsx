// Adapted from https://github.com/snakesilk/react-fullscreen
import React, { ReactNode } from "react";
import fscreen from "fscreen";

interface Props {
  enabled: boolean;
  children: ReactNode;
  onChange(fullscreen: boolean): void;
}

class FullScreen extends React.Component<Props> {
  node?: HTMLDivElement | null;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.handleProps(this.props);
    fscreen.addEventListener("fullscreenchange", this.detectFullScreen);
  }

  componentWillUnmount() {
    fscreen.removeEventListener("fullscreenchange", this.detectFullScreen);
  }

  componentDidUpdate() {
    this.handleProps(this.props);
  }

  handleProps(props: Props) {
    const enabled = fscreen.fullscreenElement === this.node;
    if (enabled && !props.enabled) {
      this.leaveFullScreen();
    } else if (!enabled && props.enabled) {
      this.enterFullScreen();
    }
  }

  detectFullScreen = () => {
    if (this.props.onChange) {
      this.props.onChange(fscreen.fullscreenElement === this.node);
    }
  };

  enterFullScreen() {
    if (fscreen.fullscreenEnabled && this.node != null) {
      fscreen.requestFullscreen(this.node);
    }
  }

  leaveFullScreen() {
    if (fscreen.fullscreenEnabled) {
      fscreen.exitFullscreen();
    }
  }

  render() {
    return (
      <div
        ref={node => {
          this.node = node;
        }}
        style={
          this.props.enabled ? { height: "100%", width: "100%" } : undefined
        }
      >
        {this.props.children}
      </div>
    );
  }
}

export default FullScreen;
