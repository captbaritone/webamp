import React, { useMemo } from "react";
import "./App.css";
import { connect } from "react-redux";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { FixedSizeGrid as Grid } from "react-window";
import Cell from "./Cell";
import { HEADING_HEIGHT } from "./constants";
import Zoom from "./Zoom";

const SkinTable = ({
  columnCount,
  columnWidth,
  rowHeight,
  windowHeight,
  skinCount,
  windowWidth,
  getSkinData,
  searchQuery,
  loadingSearchQuery,
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
  const itemRef = React.useRef();
  React.useLayoutEffect(() => {
    if (gridRef.current == null) {
      return;
    }
    gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: 0 });
  }, [skinCount]);

  React.useLayoutEffect(() => {
    if (gridRef.current == null) {
      return;
    }

    const itemRow = Math.floor(itemRef.current / columnCount);

    gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: rowHeight * itemRow });
  }, [rowHeight, columnCount]);

  const showGrid = loadingSearchQuery || skinCount > 0 || searchQuery === "";

  const onScroll = useMemo(() => {
    const half = Math.round(columnCount / 2);
    return (scrollData) => {
      itemRef.current =
        Math.round(scrollData.scrollTop / rowHeight) * columnCount + half;
    };
  }, [columnCount, rowHeight]);

  return (
    <div id="infinite-skins" style={{ marginTop: HEADING_HEIGHT }}>
      {showGrid ? (
        <>
          <Grid
            ref={gridRef}
            itemKey={itemKey}
            itemData={{ columnCount, width: columnWidth, height: rowHeight }}
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={windowHeight - HEADING_HEIGHT}
            rowCount={Math.ceil(skinCount / columnCount)}
            rowHeight={rowHeight}
            width={windowWidth}
            overscanRowsCount={5}
            onScroll={onScroll}
            style={{ overflowY: "scroll" }}
          >
            {Cell}
          </Grid>
          <Zoom columnCount={columnCount} windowWidth={windowWidth} />
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "rgb(58, 71, 88)",
            fontSize: "35px",
            paddingTop: 40,
          }}
        >
          No skins matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  skinCount: Selectors.getCurrentSkinCount(state),
  selectedSkinHash: Selectors.getSelectedSkinHash(state),
  getSkinData: Selectors.getSkinDataGetter(state),
  searchQuery: Selectors.getSearchQuery(state),
  loadingSearchQuery: Selectors.getLoadingSearchQuery(state),
});

const mapDispatchToProps = (dispatch) => ({
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(SkinTable);
