import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useActionCreator, useWindowSize } from "./hooks";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";

import WebampComponent from "./WebampComponent";
import * as Utils from "./utils";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH, API_URL } from "./constants";
import { delay, switchMap } from "rxjs/operators";
import { Subject, combineLatest, timer, fromEvent, from } from "rxjs";
import Disposable from "./Disposable";
import Metadata from "./components/Metadata";
import SkinReadme from "./SkinReadme";

// TODO: Move this to Epic
function useSkinData() {
  const hash = useSelector(Selectors.getSelectedSkinHash);
  const skinData = useSelector((state) => state.skins[hash] || null);
  const gotSkinData = useActionCreator(Actions.gotSkinData);
  useEffect(() => {
    if (
      skinData != null &&
      skinData.color != null &&
      skinData.fileName != null
    ) {
      return;
    }
    const subscription = from(fetch(`${API_URL}/skins/${hash}`))
      .pipe(switchMap((response) => response.json()))
      .subscribe((body) => {
        gotSkinData(hash, {
          md5: hash,
          fileName: body.canonicalFilename,
          color: body.averageColor,
          nsfw: body.nsfw,
        });
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [gotSkinData, hash, skinData]);
}

function useCenteredState() {
  // TODO: Observe DOM and recenter
  const { windowWidth, windowHeight } = useWindowSize();
  return useMemo(
    () => ({
      centered: true,
      top: (windowHeight - SCREENSHOT_HEIGHT) / 2,
      left: (windowWidth - SCREENSHOT_WIDTH) / 2,
      height: SCREENSHOT_HEIGHT,
      width: SCREENSHOT_WIDTH,
    }),
    [windowHeight, windowWidth]
  );
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
        this.props.centeredState
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
    const startWebampFadein = combineLatest([
      this._webampLoadedEvents,
      transitionComplete,
    ]);

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
    if (!this.state.centered) {
      this._disposable.add(
        timer(0).subscribe(() => {
          // TODO: Observe DOM and recenter
          this.setState(this.props.centeredState);
          this._transitionBeginEvents.next(null);
        })
      );
    } else {
      this._transitionBeginEvents.next(null);
    }
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }

  handleWebampLoaded = () => {
    this._webampLoadedEvents.next(null);
  };

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
        {this.props.fileExplorerOpen && <SkinReadme />}
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

function Wrapper({ ...ownProps }) {
  const hash = useSelector(Selectors.getSelectedSkinHash);
  const initialPosition = useSelector(Selectors.getSelectedSkinPosition);
  const fileExplorerOpen = useSelector(Selectors.getFileExplorerOpen);
  const skinData = useSelector((state) => state.skins[hash] || null);
  const absolutePermalink = useSelector(
    Selectors.getAbsolutePermalinkUrlFromHashGetter
  )(hash);

  const openFileExplorer = useActionCreator(Actions.openFileExplorer);
  const selectRelativeSkin = useActionCreator(Actions.selectRelativeSkin);
  const closeModal = useActionCreator(Actions.closeModal);

  useEffect(() => {
    const subscription = fromEvent(window.document, "keydown").subscribe(
      (e) => {
        if (e.key === "ArrowRight") {
          selectRelativeSkin(1);
        } else if (e.key === "ArrowLeft") {
          selectRelativeSkin(-1);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [selectRelativeSkin]);

  useSkinData();

  const centeredState = useCenteredState();

  const prevSkinHash = useRef(null);
  useEffect(() => {
    if (hash !== prevSkinHash.current) {
      document.body.classList.remove("webamp-loaded");
      prevSkinHash.current = hash;
    }
  }, [hash]);

  const props = {
    ...ownProps,
    centeredState,
    hash,
    initialPosition,
    fileExplorerOpen,
    skinData,
    absolutePermalink,
    openFileExplorer,
    selectRelativeSkin,
    closeModal,
  };
  return <BaseFocusedSkin {...props} />;
}

export default Wrapper;
