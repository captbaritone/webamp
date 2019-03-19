import { connect } from "react-redux";
import ResizeTarget from "../ResizeTarget";
import { setWindowSize } from "../../actionCreators";
import { getWindowSize } from "../../selectors";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  currentSize: [number, number];
  id: string;
}

interface DispatchProps {
  currentSize: [number, number];
  id: string;
}

const mapStateToProps = (state: AppState): StateProps => ({
  currentSize: getWindowSize(state)("playlist"),
  id: "playlist-resize-target",
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setWindowSize: (size: [number, number]) =>
      dispatch(setWindowSize("playlist", size)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResizeTarget);
