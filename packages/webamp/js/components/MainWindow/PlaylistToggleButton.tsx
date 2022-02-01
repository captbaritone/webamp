import { memo } from "react";
import classnames from "classnames";

import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { useTypedSelector, useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

function togglePlaylist() {
  return Actions.toggleWindow("playlist");
}

const PlaylistToggleButton = memo(() => {
  const selected = useTypedSelector(Selectors.getWindowOpen)("playlist");
  const handleClick = useActionCreator(togglePlaylist);
  return (
    <WinampButton
      id="playlist-button"
      className={classnames({ selected })}
      onClick={handleClick}
      title="Toggle Playlist Editor"
    />
  );
});

export default PlaylistToggleButton;
