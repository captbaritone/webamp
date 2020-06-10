import React, { useEffect } from "react";
import WebampComponent from "../WebampComponent";
import * as Utils from "../utils";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "../constants";
import { delay } from "rxjs/operators";
import { Subject, combineLatest, timer, fromEvent, from } from "rxjs";
import Disposable from "../Disposable";
import { search } from "../algolia";
import Metadata from "./Metadata";
import SkinReadme from "../SkinReadme";

function useSkinData({ hash, skinData, setSkinData }) {
  useEffect(() => {
    if (skinData != null) {
      return;
    }
    // OMG Giant hack. Kill this please. We should be able to get this data from our own server.
    return from(search(hash, { hitsPerPage: 2, typoTolerance: 0 })).subscribe(
      (results) => {
        if (results.nbHits.length === 1) {
          console.error("Failed to get skin data for hash", hash, results);
          return;
        }
        if (results.nbHits.length > 1) {
          console.error("Failed to uniquely get skin data for hash", hash);
          return;
        }
        const { fileName, color } = results.hits[0];
        setSkinData({ md5: hash, fileName, color });
      }
    );
  }, [hash, setSkinData, skinData]);
}

class BaseFocusedSkin extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    // TODO: Handle the case were we come from a permalink
    if (this.props.initialPosition == null) {
      this.state = Object.assign(
        {
          previewLoaded: false,
          loaded: false,
          transitionComplete: true,
        },
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
        height: this.props.initialHeight,
      };
    }
    this._webampLoadedEvents = new Subject();
    this._transitionBeginEvents = new Subject();
    const transitionComplete = this._transitionBeginEvents.pipe(delay(500));

    // Emit after both Webamp has loaded, and the transition is complete
    const startWebampFadein = combineLatest(
      this._webampLoadedEvents,
      transitionComplete
    );

    // This value matches the opacity transition timing for `#webamp` in CSS
    const webampFadeinComplete = startWebampFadein.pipe(delay(400));

    this._disposable.add(
      startWebampFadein.subscribe(() => {
        document.body.classList.add("webamp-loaded");
      }),
      webampFadeinComplete.subscribe(() => {
        this.setState({ loaded: true });
      }),
      () => {
        document.body.classList.remove("webamp-loaded");
      }
    );
  }

  componentDidMount() {
    this._disposable.add(
      fromEvent(window.document, "keydown").subscribe((e) => {
        if (e.key === "ArrowRight") {
          this.props.selectRelativeSkin(1);
        } else if (e.key === "ArrowLeft") {
          this.props.selectRelativeSkin(-1);
        }
      })
    );
    if (!this.state.centered) {
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
  }

  componentDidUpdate(prevProps) {
    if (prevProps.skinUrl !== this.props.skinUrl) {
      document.body.classList.remove("webamp-loaded");
    }
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
      width: SCREENSHOT_WIDTH,
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
          <>
            <div
              style={{
                position: "fixed",
                height: SCREENSHOT_HEIGHT,
                width: SCREENSHOT_WIDTH,
                transform,
              }}
            >
              <WebampComponent
                key={this.props.hash} // Don't reuse instances
                skinUrl={Utils.skinUrlFromHash(this.props.hash)}
                loaded={this.handleWebampLoaded}
                closeModal={this.props.closeModal}
              />
            </div>
            {this.props.fileExplorerOpen && <SkinReadme />}
          </>
        )}
        <div
          id="focused-skin"
          style={{
            position: "fixed",
            height: this.state.height,
            width: this.state.width,
            transform,
            transition:
              "all 400ms ease-out, height 400ms ease-out, width 400ms ease-out",
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
                  display: "block",
                  opacity:
                    this.state.previewLoaded ||
                    this.props.initialPosition != null
                      ? 1
                      : 0,
                  transition: "opacity 0.2s ease-out",
                }}
                onLoad={() => this.setState({ previewLoaded: true })}
                src={Utils.screenshotUrlFromHash(this.props.hash)}
                alt={this.props.skinData && this.props.skinData.fileName}
              />
            )}
          </div>
        </div>
        <Metadata
          permalink={this.props.absolutePermalink}
          openFileExplorer={this.props.openFileExplorer}
          fileName={this.props.skinData && this.props.skinData.fileName}
          hash={this.props.hash}
        />
      </React.Fragment>
    );
  }
}

export default (props) => {
  const { hash, skinData, setSkinData } = props;
  useSkinData({ hash, skinData, setSkinData });
  return <BaseFocusedSkin {...props} />;
};
