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

// Render your table

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowHeight: null,
      columnWidth: null
    };
  }

  _sizeIsSet() {
    return this.state.rowHeight !== null && this.state.columnWidth !== null;
  }

  render() {
    const rowHeight = 100;
    const columnWidth = 100;
    return (
      <div>
        <Head />
        <Header />
        <SkinTable
          setCellSize={({ rowHeight, columnWidth }) =>
            this.setState({ rowHeight, columnWidth })
          }
        />
        {this.props.aboutPage ? (
          <Overlay>
            <About />
          </Overlay>
        ) : (
          !this._sizeIsSet() ||
          this.props.selectedSkinHash == null || (
            <Overlay shouldAnimate={this.props.overlayShouldAnimate}>
              <FocusedSkin
                key={this.props.selectedSkinHash}
                initialHeight={rowHeight}
                initialWidth={columnWidth}
              />
            </Overlay>
          )
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  overlayShouldAnimate: Selectors.overlayShouldAnimate(state),
  aboutPage: Selectors.getActiveContentPage(state) === ABOUT_PAGE
});

export default connect(mapStateToProps)(App);
