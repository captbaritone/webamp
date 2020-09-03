import React from "react";
import "./App.css";
import { connect } from "react-redux";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { FixedSizeGrid as Grid } from "react-window";
import Cell from "./Cell";

const SkinTable = ({
  columnCount,
  columnWidth,
  rowHeight,
  windowHeight,
  skinCount,
  windowWidth,
  getSkinData,
}) => {
  function itemKey({ columnIndex, rowIndex }) {
    const { requestToken, data: skin } = getSkinData({
      columnIndex,
      rowIndex,
      columnCount,
    });
    if (skin == null && requestToken == null) {
      return `empty-cell-${columnIndex}-${rowIndex}`;
    }
    return skin ? skin.hash : `unfectched-index-${requestToken}`;
  }
  const gridRef = React.useRef();
  React.useLayoutEffect(() => {
    if (gridRef.current == null) {
      return;
    }
    gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: 0 });
  }, [skinCount]);
  return (
    <div id="infinite-skins">
      <Grid
        ref={gridRef}
        itemKey={itemKey}
        itemData={{ columnCount, width: columnWidth, height: rowHeight }}
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={windowHeight}
        rowCount={Math.ceil(skinCount / columnCount)}
        rowHeight={rowHeight}
        width={windowWidth}
        overscanRowsCount={5}
      >
        {Cell}
      </Grid>
    </div>
  );
};

const mapStateToProps = (state) => ({
  skinCount: Selectors.getCurrentSkinCount(state),
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  getSkinData: Selectors.getSkinDataGetter(state),
});

const mapDispatchToProps = (dispatch) => ({
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(SkinTable);
