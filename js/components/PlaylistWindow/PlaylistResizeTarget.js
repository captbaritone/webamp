import { connect } from "react-redux";
import ResizeTarget from "../ResizeTarget";
import { setPlaylistSize } from "../../actionCreators";

const mapStateToProps = state => ({
  currentSize: state.display.playlistSize,
  id: "playlist-resize-target"
});

const mapDispatchToProps = { setWindowSize: setPlaylistSize };

export default connect(mapStateToProps, mapDispatchToProps)(ResizeTarget);
