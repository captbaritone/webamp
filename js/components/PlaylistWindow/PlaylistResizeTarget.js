import { connect } from "react-redux";
import ResizeTarget from "../ResizeTarget";
import { setPlaylistSize } from "../../actionCreators";
import {
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT
} from "../../constants";

const mapStateToProps = state => ({
  currentSize: state.display.playlistSize,
  resizeSegmentWidth: PLAYLIST_RESIZE_SEGMENT_WIDTH,
  resizeSegmentHeight: PLAYLIST_RESIZE_SEGMENT_HEIGHT,
  id: "playlist-resize-target"
});

const mapDispatchToProps = { setPlaylistSize };

export default connect(mapStateToProps, mapDispatchToProps)(ResizeTarget);
