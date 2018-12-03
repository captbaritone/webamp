import React from "react";
import { connect } from "react-redux";
import WebampComponent from "./WebampComponent";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "./constants";
import { delay, first } from "rxjs/operators";
import { Subject, combineLatest, timer } from "rxjs";
import Disposable from "./Disposable";

class FocusedSkin extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    // TODO: Handle the case were we come from a permalink
    if (this.props.initialPosition == null) {
      this.state = Object.assign(
        { loaded: false, transitionComplete: true },
        this._getCenteredState()
      );
    } else {
      this.state = {
        loaded: false,
        centered: false,
        transitionComplete: false,
        top: this.props.initialPosition.top,
        left: this.props.initialPosition.left,
        width: this.props.initialWidth,
        height: this.props.initialHeight
      };
    }
    this._webampLoadedEvents = new Subject();
    this._transitionBeginEvents = new Subject();
  }

  componentDidMount() {
    if (!this.props.centered) {
      this._disposable.add(
        timer(0).subscribe(() => {
          // TODO: Observe DOM and recenter
          this.setState(this._getCenteredState());
          this._transitionBeginEvents.next(null);
        })
      );
    } else {
      this._transitionBeginEvents.next(null);
    }

    const transitionComplete = this._transitionBeginEvents.pipe(delay(500));

    // Emit after both Webamp has loaded, and the transition is complete
    const startWebampFadein = combineLatest(
      this._webampLoadedEvents,
      transitionComplete
    ).pipe(first());

    // This value matches the opacity transition timing for `#webamp` in CSS
    const webampFadeinComplete = startWebampFadein.pipe(delay(400));

    this._disposable.add(
      startWebampFadein.subscribe(() => {
        document.body.classList.add("webamp-loaded");
        this._disposable.add(() => {
          document.body.classList.remove("webamp-loaded");
        });
      }),
      webampFadeinComplete.subscribe(() => {
        this.setState({ loaded: true });
      })
    );
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }

  handleWebampLoaded = () => {
    this._webampLoadedEvents.next(null);
  };

  _getCenteredState() {
    // TODO: Observe DOM and recenter
    const { windowWidth, windowHeight } = Utils.getWindowSize();
    return {
      centered: true,
      top: (windowHeight - SCREENSHOT_HEIGHT) / 2,
      left: (windowWidth - SCREENSHOT_WIDTH) / 2,
      height: SCREENSHOT_HEIGHT,
      width: SCREENSHOT_WIDTH
    };
  }
  render() {
    const { loaded } = this.state;
    const transform = `translateX(${Math.round(
      this.state.left
    )}px) translateY(${Math.round(this.state.top)}px)`;

    return (
      <React.Fragment>
        {this.state.centered && (
          <div
            style={{
              position: "fixed",
              height: SCREENSHOT_HEIGHT,
              width: SCREENSHOT_WIDTH,
              transform
            }}
          >
            <WebampComponent
              key={this.props.hash} // Don't reuse instances
              skinUrl={Utils.skinUrlFromHash(this.props.hash)}
              loaded={this.handleWebampLoaded}
            />
          </div>
        )}
        <div
          id="focused-skin"
          style={{
            position: "fixed",
            height: this.state.height,
            width: this.state.width,
            transform,
            transition:
              "all 400ms ease-out, height 400ms ease-out, width 400ms ease-out"
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            {loaded || (
              <img
                className={"focused-preview"}
                style={{
                  width: "100%",
                  height: "100%",
                  // Webamp measure the scrollHeight of the container. Making this a
                  // block element ensures the parent element's scrollHeight is not
                  // expanded.
                  display: "block"
                }}
                src={Utils.screenshotUrlFromHash(this.props.hash)}
              />
            )}
          </div>
          <div className="metadata">
            <div className="file-name">
              {Utils.filenameFromHash(this.props.hash)}
            </div>
            <a href={Utils.skinUrlFromHash(this.props.hash)}>Download</a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  hash: Selectors.getSelectedSkinHash(state),
  initialPosition: Selectors.getSelectedSkinPosition(state)
});

export default connect(mapStateToProps)(FocusedSkin);
