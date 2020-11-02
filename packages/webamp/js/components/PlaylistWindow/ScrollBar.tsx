import { memo } from "react";

// Here we import the rc-slider class just to get it's type.
// We expect the Typescript compiler to not actually include this in the bundle.
import RcSlider from "rc-slider";
// @ts-ignore
import SliderComponent from "rc-slider/lib/Slider";

import {
  getAllTracksAreVisible,
  getPlaylistScrollPosition,
} from "../../selectors";
import * as Actions from "../../actionCreators";
import { useTypedSelector, useActionCreator } from "../../hooks";

// Here we inform TypeScript to use the default export's type for our partial import.
const Slider = SliderComponent as typeof RcSlider;

const Handle = () => <div className="playlist-scrollbar-handle" />;

const ScrollBar = () => {
  const playlistScrollPosition = useTypedSelector(getPlaylistScrollPosition);
  const allTracksAreVisible = useTypedSelector(getAllTracksAreVisible);
  const setPlaylistScrollPosition = useActionCreator((position: number) =>
    Actions.setPlaylistScrollPosition(100 - position)
  );
  return (
    <Slider
      className="playlist-scrollbar"
      min={0}
      max={100}
      step={1}
      value={playlistScrollPosition}
      onChange={setPlaylistScrollPosition}
      vertical
      handle={Handle}
      disabled={allTracksAreVisible}
    />
  );
};

export default memo(ScrollBar);
