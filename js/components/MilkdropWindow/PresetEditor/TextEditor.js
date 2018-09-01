import React from "react";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initial
    };
  }

  componentDidMount() {
    this.previousActiveElm = document.activeElement;
    this.textarea.focus();
    this.textarea.addEventListener("keydown", e => {
      if (e.ctrlKey) {
        switch (e.keyCode) {
          case 13: // CTRL + enter
            this.props.updateValue(this.state.value);
            this.props.closeEditor();
            break;
        }
      } else {
        switch (e.keyCode) {
          case 27: // escape
            this.props.closeEditor();
            break;
        }
      }

      // Prevent global keyhandlers from picking up typing
      e.stopPropagation();
    });
  }

  componentWillUnmount() {
    this.previousActiveElm.focus();
  }

  handleTextChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div>
        <div>
          <span style={{ color: "#CCCCCC" }}>
            Enter the new string; hit CTRL+ENTER to apply or ESC to cancel.
          </span>
        </div>
        <textarea
          style={{
            width: `${this.props.width - 30}px`,
            height: `${this.props.height - 30}px`,
            backgroundColor: "transparent",
            color: "#CCCCCC",
            border: 0
          }}
          ref={textarea => {
            this.textarea = textarea;
          }}
          value={this.state.value}
          onChange={ev => this.handleTextChange(ev)}
        />
      </div>
    );
  }
}

export default TextEditor;
