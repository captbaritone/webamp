import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as ActionCreators from "./redux/actionCreators";

class Overlay extends React.Component {
  constructor() {
    super();
    this._node = document.createElement("div");
    this._node.classList.add("overlay");
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleClick = this._handleClick.bind(this);

    window.document.body.appendChild(this._node);
  }

  componentDidMount() {
    window.document.addEventListener("keydown", this._handleKeyDown);
    // TODO: This is technically a race condition, since we could unmount before this fires.
    requestAnimationFrame(() => {
      // This does not seem to work the first time.
      // This should _not_ work on page load
      document.body.classList.add("overlay-open");
    });
  }

  componentWillUnmount() {
    window.document.body.removeChild(this._node);
    window.document.removeEventListener("keydown", this._handleKeyDown);
    document.body.classList.remove("overlay-open");
  }

  _handleKeyDown(e) {
    // Esc
    if (e.keyCode === 27) {
      this.props.closeModal();
    }
  }

  _handleClick(e) {
    if (e.target === e.currentTarget) {
      this.props.closeModal();
    }
  }
  render() {
    return ReactDOM.createPortal(
      <div
        style={{
          width: "100%",
          height: "100%"
        }}
        onClick={this._handleClick}
        onScroll={e => e.stopPropagation()}
      >
        <a
          id="close-modal"
          href="/"
          onClick={e => {
            this.props.closeModal();
            e.preventDefault();
          }}
          aria-label="Close Modal"
        >
          &times;
        </a>
        {this.props.children}
      </div>,
      this._node
    );
  }
}

const mapDispatchToProps = dispatch => ({
  closeModal() {
    dispatch(ActionCreators.closeModal());
  }
});
export default connect(
  null,
  mapDispatchToProps
)(Overlay);
