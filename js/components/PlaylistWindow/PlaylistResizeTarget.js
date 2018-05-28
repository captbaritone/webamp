import { connect } from "react-redux";
import ResizeTarget from "../ResizeTarget";
import { setWindowSize } from "../../actionCreators";
import { getWindowSize } from "../../selectors";

const mapStateToProps = state => ({
  currentSize: getWindowSize(state, "playlist"),
  id: "playlist-resize-target"
});

const mapDispatchToProps = {
  setWindowSize: size => setWindowSize("playlist", size)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResizeTarget);
