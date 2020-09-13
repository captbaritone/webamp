import React, { useCallback } from "react";
import { connect } from "react-redux";
import Head from "./Head";
import About from "./About";
import Header from "./Header";
import Overlay from "./Overlay";
import SkinTable from "./SkinTable";
import FocusedSkin from "./FocusedSkin";
import { useSelector } from "react-redux";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { ABOUT_PAGE } from "./constants";
import {
  useWindowSize,
  useScrollbarWidth,
  useDropFiles,
  useActionCreator,
} from "./hooks";
import { SCREENSHOT_WIDTH, SKIN_RATIO } from "./constants";
import UploadGrid from "./UploadGrid";
import DropTarget from "./DropTarget";
import Metadata from "./components/Metadata";
import SkinReadme from "./SkinReadme";

const getTableDimensions = (windowWidth, scale) => {
  const columnCount = Math.floor(windowWidth / (SCREENSHOT_WIDTH * scale));
  const columnWidth = windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
  const rowHeight = columnWidth * SKIN_RATIO;
  return { columnWidth, rowHeight, columnCount };
};

function useDropTarget() {
  const gotFiles = useActionCreator(Actions.gotFiles);
  const areDragging = useSelector(Selectors.getAreDragging);

  const onDrop = useCallback(
    (e) => {
      gotFiles(Array.from(e.dataTransfer.files));
    },
    [gotFiles]
  );
  const setDragging = useActionCreator(Actions.setDragging);
  useDropFiles({ onDrop, setDragging });
  return areDragging;
}

function App(props) {
  const scrollbarWidth = useScrollbarWidth();
  const {
    windowWidth: windowWidthWithScrollabar,
    windowHeight,
  } = useWindowSize();

  const { columnWidth, rowHeight, columnCount } = getTableDimensions(
    windowWidthWithScrollabar - scrollbarWidth,
    props.scale
  );

  const fileExplorerOpen = useSelector(Selectors.getFileExplorerOpen);

  const areDragging = useDropTarget();

  return (
    <div>
      <Head />
      <Header />
      {areDragging ? (
        <DropTarget />
      ) : props.uploadViewOpen ? (
        <UploadGrid />
      ) : (
        <SkinTable
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          windowHeight={windowHeight}
          windowWidth={windowWidthWithScrollabar}
        />
      )}
      {props.aboutPage ? (
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
  );
}

const mapStateToProps = (state) => ({
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  overlayShouldAnimate: Selectors.overlayShouldAnimate(state),
  aboutPage: Selectors.getActiveContentPage(state) === ABOUT_PAGE,
  scale: state.scale,
  uploadViewOpen: Selectors.getHaveUploadFiles(state),
});

export default connect(mapStateToProps)(App);
