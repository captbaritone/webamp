import VerticalSlider from "../VerticalSlider";

import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { useTypedSelector, useActionCreator } from "../../hooks";
import { WINDOWS } from "../../constants";

const HANDLE_HEIGHT = 18;

const Handle = () => (
  <div
    className="playlist-scrollbar-handle"
    style={{ height: HANDLE_HEIGHT }}
  />
);

export default function PlaylistScrollBar() {
  const getWindowPixelSize = useTypedSelector(Selectors.getWindowPixelSize);
  const playlistHeight = getWindowPixelSize(WINDOWS.PLAYLIST).height;
  const playlistScrollPosition = useTypedSelector(
    Selectors.getPlaylistScrollPosition
  );
  const allTracksAreVisible = useTypedSelector(
    Selectors.getAllTracksAreVisible
  );
  const setPlaylistScrollPosition = useActionCreator(
    Actions.setPlaylistScrollPosition
  );
  return (
    <div className="playlist-scrollbar" style={{ marginLeft: 5 }}>
      <VerticalSlider
        height={playlistHeight - 58}
        handleHeight={HANDLE_HEIGHT}
        width={8}
        value={playlistScrollPosition / 100}
        onChange={(val) => setPlaylistScrollPosition(val * 100)}
        handle={<Handle />}
        disabled={allTracksAreVisible}
      />
    </div>
  );
}
