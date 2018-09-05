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
    this.textarea.addEventListener("keydown", async e => {
      if (e.ctrlKey) {
        switch (e.keyCode) {
          case 13: // CTRL + enter
            this.setState({
              showCompiling: true,
              showError: false
            });
            try {
              await this.props.updateValue(this.state.value);
              this.props.closeEditor();
            } catch (err) {
              this.setState({
                showCompiling: false,
                showError: true,
                errorMessage: err.message
              });
            }
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
        {this.state.showCompiling && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(40, 40, 40, 0.815)",
              color: "#CCCCCC",
              fontSize: "16px"
            }}
          >
            <div style={{ display: "grid", height: "100%" }}>
              <span style={{ margin: "auto" }}>COMPILING!</span>
            </div>
          </div>
        )}
        {this.state.showError && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "100%",
              height: "20%",
              background: "rgba(40, 0, 0, 0.815)",
              color: "#CCCCCC",
              fontSize: "12px",
              whiteSpace: "pre-line"
            }}
          >
            <span>{this.state.errorMessage}</span>
          </div>
        )}
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
