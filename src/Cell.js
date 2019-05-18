import React from "react";
import "./App.css";
import { connect } from "react-redux";
import Skin from "./Skin";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";

const Cell = React.memo(props => {
  const {
    style,
    data,
    index,
    skin,
    requestToken,
    setSelectedSkin,
    requestUnloadedSkin
  } = props;
  const { width, height } = data;
  React.useEffect(() => {
    if (skin == null && requestToken != null) {
      requestUnloadedSkin(requestToken);
    }
  }, [skin, requestUnloadedSkin, requestToken]);
  if (skin == null) {
    if (requestToken == null) {
      // This is an empty cell in the last row
      return null;
    }
    return (
      <div
        key={`placeholder-${index}`}
        style={{
          ...style,
          width,
          height,
          backgroundColor: requestToken == null ? "blue" : "magenta"
        }}
      />
    );
  }
  const { hash, color } = skin;
  return (
    <Skin
      style={style}
      href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
      src={Utils.screenshotUrlFromHash(hash)}
      key={hash}
      hash={hash}
      height={height}
      width={width}
      selectSkin={setSelectedSkin}
      color={color}
      permalink={Utils.getPermalinkUrlFromHashAndFilename(hash, skin.fileName)}
    />
  );
});

const mapStateToProps = (state, ownProps) => {
  const skinDataGetter = Selectors.getSkinDataGetter(state);
  const { rowIndex, columnIndex, data } = ownProps;
  const { columnCount } = data;
  const { requestToken, data: skin } = skinDataGetter({
    columnCount,
    rowIndex,
    columnIndex
  });
  return {
    requestToken,
    skin,
    selectedSkinHash: Selectors.getSelectedSkinHash(state)
  };
};

const mapDispatchToProps = dispatch => ({
  requestUnloadedSkin(index) {
    dispatch(Actions.requestUnloadedSkin(index));
  },
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Cell);
