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
    this._handleTouchMove = this._handleTouchMove.bind(this);

    window.document.body.appendChild(this._node);
  }

  componentDidMount() {
    window.document.addEventListener("keydown", this._handleKeyDown);
    window.document.addEventListener("touchmove", this._handleTouchMove);
    // TODO: This is technically a race condition, since we could unmount before this fires.
    if (this.props.shouldAnimate) {
      setTimeout(() => {
        // This does not seem to work the first time.
        // This should _not_ work on page load
        document.body.classList.add("overlay-open");
      }, 0);
    } else {
      document.body.classList.add("overlay-open");
    }
  }

  componentWillUnmount() {
    window.document.body.removeChild(this._node);
    window.document.removeEventListener("keydown", this._handleKeyDown);
    window.document.removeEventListener("touchmove", this._handleTouchMove);
    document.body.classList.remove("overlay-open");
  }

  _handleTouchMove(e) {
    e.preventDefault();
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
          height: "100%",
          // This one werid hack to work around margin collapse which was making
          // children with top margins cause the top protion of the overlay to
          // be unclickable: https://stackoverflow.com/a/47351270/1263117
          display: "flex",
          flexDirection: "column"
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
