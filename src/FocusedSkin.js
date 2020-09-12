import React, { useEffect, useMemo, useRef, useState } from "react";
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

class AnimationWrapper extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    // TODO: Handle the case were we come from a permalink
    this.state = {
      loaded: false,
      centered: this.props.initialPosition == null,
    };
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

    // Once webamp has loaded and the transition is complete, we can start the Webamp fadein
    // Once the webamp fadein is complete (400ms) we are "loaded"

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
    if (this.props.initialPosition != null) {
      this._disposable.add(
        timer(0).subscribe(() => {
          // TODO: Observe DOM and recenter
          this.setState({ centered: true });
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
    return this.props.children({
      handleWebampLoaded: () => this.handleWebampLoaded(),
      centered: this.state.centered,
      loaded: this.state.loaded,
    });
  }
}

function BaseFocusedSkin({
  initialPosition,
  centered,
  hash,
  handleWebampLoaded,
  loaded,
}) {
  const [previewLoaded, setPreviewLoaded] = useState(initialPosition != null);
  const centeredState = useCenteredState();
  const closeModal = useActionCreator(Actions.closeModal);
  const skinData = useSelector((state) => state.skins[hash] || null);
  const fileExplorerOpen = useSelector(Selectors.getFileExplorerOpen);
  const openFileExplorer = useActionCreator(Actions.openFileExplorer);

  const absolutePermalink = useSelector(
    Selectors.getAbsolutePermalinkUrlFromHashGetter
  )(hash);
  const pos =
    initialPosition == null || centered ? centeredState : initialPosition;

  const transform = `translateX(${Math.round(
    pos.left
  )}px) translateY(${Math.round(pos.top)}px)`;

  return (
    <React.Fragment>
      {centered && (
        <>
          <div
            id="here"
            style={{
              position: "fixed",
              height: SCREENSHOT_HEIGHT,
              width: SCREENSHOT_WIDTH,
              transform,
            }}
          >
            <WebampComponent
              key={hash} // Don't reuse instances
              skinUrl={Utils.skinUrlFromHash(hash)}
              loaded={handleWebampLoaded}
              closeModal={closeModal}
            />
          </div>
        </>
      )}
      <div
        id="focused-skin"
        style={{
          position: "fixed",
          height: pos.height,
          width: pos.width,
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
                opacity: previewLoaded || initialPosition != null ? 1 : 0,
                transition: "opacity 0.2s ease-out",
              }}
              onLoad={() => setPreviewLoaded(true)}
              src={Utils.screenshotUrlFromHash(hash)}
              alt={skinData && skinData.fileName}
            />
          )}
        </div>
      </div>
      {fileExplorerOpen && <SkinReadme />}
      <Metadata
        permalink={absolutePermalink}
        openFileExplorer={openFileExplorer}
        fileName={skinData && skinData.fileName}
        hash={hash}
      />
    </React.Fragment>
  );
}

function Wrapper({ ...ownProps }) {
  const hash = useSelector(Selectors.getSelectedSkinHash);
  const initialPosition = useSelector(Selectors.getSelectedSkinPosition);

  const selectRelativeSkin = useActionCreator(Actions.selectRelativeSkin);

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

  const prevSkinHash = useRef(null);
  useEffect(() => {
    if (hash !== prevSkinHash.current) {
      document.body.classList.remove("webamp-loaded");
      prevSkinHash.current = hash;
    }
  }, [hash]);

  const props = { ...ownProps, hash, initialPosition };
  return (
    <AnimationWrapper initialPosition={initialPosition}>
      {({ centered, handleWebampLoaded, loaded }) => (
        <BaseFocusedSkin
          {...props}
          centered={centered}
          handleWebampLoaded={handleWebampLoaded}
          loaded={loaded}
        />
      )}
    </AnimationWrapper>
  );
}

export default Wrapper;
