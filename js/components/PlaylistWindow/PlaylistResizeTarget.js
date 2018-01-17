import { connect } from "react-redux";
import ResizeTarget from "../ResizeTarget";
import { PLAYLIST_SIZE_CHANGED } from "../../actionTypes";
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

const mapDispatchToProps = {
  setPlaylistSize: size => ({ type: PLAYLIST_SIZE_CHANGED, size })
};

export default connect(mapStateToProps, mapDispatchToProps)(ResizeTarget);
