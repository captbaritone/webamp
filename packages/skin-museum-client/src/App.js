import React, { useCallback } from "react";
import { connect } from "react-redux";
import Head from "./Head";
import About from "./About";
import Feedback from "./Feedback";
import Header from "./Header";
import Overlay from "./Overlay";
import SkinTable from "./SkinTable";
import FocusedSkin from "./FocusedSkin";
import { useSelector } from "react-redux";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { ABOUT_PAGE, REVIEW_PAGE } from "./constants";
import { useWindowSize, useScrollbarWidth, useActionCreator } from "./hooks";
import { SCREENSHOT_WIDTH, SKIN_RATIO } from "./constants";
import UploadGrid from "./upload/UploadGrid";
import Metadata from "./components/Metadata";
import SkinReadme from "./SkinReadme";
import { useDropzone } from "react-dropzone";
import ReviewPage from "./ReviewPage";
import DebugSkin from "./debug/DebugSkin";

const getTableDimensions = (windowWidth, scale) => {
  const columnCount = Math.round(windowWidth / (SCREENSHOT_WIDTH * scale));
  const columnWidth = windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
  const rowHeight = columnWidth * SKIN_RATIO;
  return { columnWidth, rowHeight, columnCount };
};

function App(props) {
  const scrollbarWidth = useScrollbarWidth();
  const { windowWidth: windowWidthWithScrollabar, windowHeight } =
    useWindowSize();

  const { columnWidth, rowHeight, columnCount } = getTableDimensions(
    windowWidthWithScrollabar - scrollbarWidth,
    props.scale
  );
  const gotFiles = useActionCreator(Actions.gotFiles);

  const onDrop = useCallback(
    (acceptedFiles) => {
      gotFiles(acceptedFiles);
      // Do something with the files
    },
    [gotFiles]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
  });

  const fileExplorerOpen = useSelector(Selectors.getFileExplorerOpen);

  if (props.page === REVIEW_PAGE) {
    return <ReviewPage />;
  }

  if (props.debugViewOpen && props.selectedSkinHash) {
    return <DebugSkin md5={props.selectedSkinHash} />;
  }

  return (
    <div>
      <Head />
      <Header />
      <div {...getRootProps()}>
        {props.uploadViewOpen || isDragActive ? (
          <UploadGrid
            isDragActive={isDragActive}
            getInputProps={getInputProps}
          />
        ) : (
          <SkinTable
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            windowHeight={windowHeight}
            windowWidth={windowWidthWithScrollabar}
          />
        )}
        {props.showFeedbackForm ? (
          <Overlay>
            <Feedback />
          </Overlay>
        ) : props.page === ABOUT_PAGE ? (
          <Overlay>
            <About />
          </Overlay>
        ) : (
          props.selectedSkinHash == null || (
            <Overlay shouldAnimate={props.overlayShouldAnimate}>
              <FocusedSkin
                key={props.selectedSkinHash}
                hash={props.selectedSkinHash}
                initialHeight={rowHeight}
                initialWidth={columnWidth}
              />
              {fileExplorerOpen && <SkinReadme />}
              <Metadata />
            </Overlay>
          )
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  overlayShouldAnimate: Selectors.overlayShouldAnimate(state),
  page: Selectors.getActiveContentPage(state),
  scale: state.scale,
  uploadViewOpen: Selectors.getUploadViewOpen(state),
  showFeedbackForm: state.showFeedbackForm,
  debugViewOpen: Selectors.getDebugViewOpen(state),
});

export default connect(mapStateToProps)(App);
