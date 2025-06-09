import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useActionCreator, useWindowSize, useWebampAnimation } from "./hooks";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";

import WebampComponent from "./WebampComponent";
import * as Utils from "./utils";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "./constants";
import { fromEvent } from "rxjs";

// TODO: Move to epic
function useSkinKeyboardControls() {
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
}

function useCenteredState() {
  // TODO: Observe DOM and recenter
  const { windowWidth, windowHeight } = useWindowSize();
  return useMemo(
    () => ({
      top: (windowHeight - SCREENSHOT_HEIGHT) / 2,
      left: (windowWidth - SCREENSHOT_WIDTH) / 2,
      height: SCREENSHOT_HEIGHT,
      width: SCREENSHOT_WIDTH,
    }),
    [windowHeight, windowWidth]
  );
}

function FocusedSkin() {
  const hash = useSelector(Selectors.getSelectedSkinHash);
  const initialPosition = useSelector(Selectors.getSelectedSkinPosition);

  useSkinKeyboardControls();

  const { handleWebampLoaded, loaded, centered } = useWebampAnimation({
    initialPosition,
  });
  const [previewLoaded, setPreviewLoaded] = useState(initialPosition != null);
  const centeredState = useCenteredState();
  const closeModal = useActionCreator(Actions.closeModal);
  const skinData = useSelector(Selectors.getSelectedSkinData);

  const pos =
    initialPosition == null || centered ? centeredState : initialPosition;

  const transform = `translateX(${Math.round(
    pos.left
  )}px) translateY(${Math.round(pos.top)}px)`;

  return (
    <React.Fragment>
      {centered && (
        <div
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
      )}
      {loaded || (
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
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default FocusedSkin;
