import React from "react";
import "./App.css";
import { connect } from "react-redux";
import { SKIN_CDN } from "./constants";
import Skin from "./components/Skin";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";

const Cell = React.memo((props) => {
  const {
    style,
    data,
    index,
    skin,
    requestToken,
    setSelectedSkin,
    requestUnloadedSkin,
    permalinkUrl,
    consentsToNsfw,
    doesNotConcentToNsfw,
    showNsfw,
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
        }}
      />
    );
  }
  const { hash, color, nsfw } = skin;
  return (
    <Skin
      style={style}
      href={`https://webamp.org/?skinUrl=${SKIN_CDN}/skins/${hash}.wsz`}
      src={Utils.screenshotUrlFromHash(hash)}
      key={hash}
      hash={hash}
      height={height}
      width={width}
      selectSkin={setSelectedSkin}
      color={color}
      nsfw={nsfw}
      // TODO: This is werid because there is an implicit assumption that this is always avaliable if we have the skin
      permalink={permalinkUrl}
      consentsToNsfw={consentsToNsfw}
      doesNotConcentToNsfw={doesNotConcentToNsfw}
      showNsfw={showNsfw}
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
    columnIndex,
  });
  const getPermalinkUrlFromHash =
    Selectors.getPermalinkUrlFromHashGetter(state);
  return {
    requestToken,
    skin,
    permalinkUrl: skin == null ? null : getPermalinkUrlFromHash(skin.hash),
    showNsfw: state.showNsfw,
  };
};

const mapDispatchToProps = (dispatch) => ({
  requestUnloadedSkin(index) {
    dispatch(Actions.requestUnloadedSkin(index));
  },
  setSelectedSkin(hash, position) {
    dispatch(Actions.selectedSkin(hash, position));
  },
  consentsToNsfw() {
    dispatch(Actions.consentsToNsfw());
  },

  doesNotConcentToNsfw() {
    dispatch(Actions.doesNotConcentToNsfw());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Cell);
