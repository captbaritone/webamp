import React from "react";
import { connect } from "react-redux";
import Head from "./Head";
import Header from "./Header";
import Overlay from "./Overlay";
import SkinTable from "./SkinTable";
import FocusedSkin from "./FocusedSkin";
import * as Selectors from "./redux/selectors";

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
        {!this._sizeIsSet() || this.props.selectedSkinHash == null || (
          <Overlay>
            <FocusedSkin initialHeight={rowHeight} initialWidth={columnWidth} />
          </Overlay>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedSkinHash: Selectors.getSelectedSkinHash(state)
});

export default connect(mapStateToProps)(App);
