import { connect } from "react-redux";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import BaseFocusedSkin from "./components/BaseFocusedSkin";

const mapStateToProps = (state, ownProps) => {
  return {
    hash: Selectors.getSelectedSkinHash(state),
    initialPosition: Selectors.getSelectedSkinPosition(state),
    fileExplorerOpen: Selectors.getFileExplorerOpen(state),
    skinData: state.skins[ownProps.hash] || null,
    absolutePermalink: Selectors.getAbsolutePermalinkUrlFromHashGetter(state)(
      ownProps.hash
    )
  };
};

const mapDispatchToProps = dispatch => ({
  gotSkinData(hash, data) {
    dispatch({ type: "GOT_SKIN_DATA", hash, data });
  },
  selectRelativeSkin(offset) {
    dispatch(Actions.selectRelativeSkin(offset));
  },
  openFileExplorer() {
    dispatch(Actions.openFileExplorer());
  },
  closeModal() {
    dispatch(Actions.closeModal());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(BaseFocusedSkin);
