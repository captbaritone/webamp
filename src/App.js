import React from "react";
import { connect } from "react-redux";
import Head from "./Head";
import About from "./About";
import Header from "./Header";
import Overlay from "./Overlay";
import SkinTable from "./SkinTable";
import FocusedSkin from "./FocusedSkin";
import * as Selectors from "./redux/selectors";
import { ABOUT_PAGE } from "./constants";
import * as Utils from "./utils";
import { SCREENSHOT_WIDTH, SKIN_RATIO } from "./constants";

// Render your table

const getTableDimensions = (windowWidth, scale) => {
  const columnCount = Math.floor(windowWidth / (SCREENSHOT_WIDTH * scale));
  const columnWidth = windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
  const rowHeight = columnWidth * SKIN_RATIO;
  return { columnWidth, rowHeight, columnCount };
};

function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState(Utils.getWindowSize());
  React.useEffect(() => {
    // TODO: Consider thottle
    const handleResize = () => {
      setWindowSize(Utils.getWindowSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

function App(props) {
  const { windowWidth, windowHeight } = useWindowSize();
  const { columnWidth, rowHeight, columnCount } = getTableDimensions(
    windowWidth,
    props.scale
  );
  return (
    <div>
      <Head />
      <Header />
      <SkinTable
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        windowHeight={windowHeight}
        windowWidth={windowWidth}
      />
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
});

export default connect(mapStateToProps)(App);
