import React from "react";

class IntEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initial
    };
  }

  componentDidMount() {
    this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
      this._handleFocusedKeyboardInput
    );
  }

  componentWillUnmount() {
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
  }

  _handleFocusedKeyboardInput = e => {
    switch (e.keyCode) {
      case 33: // page up
        this.setState({
          value: Math.min(this.state.value + 10, this.props.max)
        });
        e.stopPropagation();
        break;
      case 34: // page down
        this.setState({
          value: Math.max(this.state.value - 10, this.props.min)
        });
        e.stopPropagation();
        break;
      case 38: // up arrow
        this.setState({
          value: Math.min(this.state.value + 1, this.props.max)
        });
        e.stopPropagation();
        break;
      case 40: // down arrow
        this.setState({
          value: Math.max(this.state.value - 1, this.props.min)
        });
        e.stopPropagation();
        break;
      case 13: // enter
        this.props.updateValue(this.state.value);
        this.props.closeEditor();
        e.stopPropagation();
        break;
    }
  };

  render() {
    return (
      <div>
        <div>
          <span style={{ color: "#CCCCCC" }}>
            (use up/down arrow keys, PGUP, PGDN to change value)
          </span>
        </div>
        <div>
          <span style={{ color: "#CCCCCC" }}>
            Current value of {this.props.name}:
          </span>
        </div>
        <div>
          <span style={{ color: "#FFCC22" }}>{this.state.value}</span>
        </div>
      </div>
    );
  }
}

IntEditor.defaultProps = {
  default: 0,
  min: -Infinity,
  max: Infinity
};

export default IntEditor;
