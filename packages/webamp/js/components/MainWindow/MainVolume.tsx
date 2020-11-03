import { memo } from "react";
import * as Selectors from "../../selectors";

import Volume from "../Volume";
import { useTypedSelector } from "../../hooks";

const MainVolume = memo(() => {
  const volume = useTypedSelector(Selectors.getVolume);
  const percent = volume / 100;
  const sprite = Math.round(percent * 28);
  const offset = (sprite - 1) * 15;

  const style = {
    backgroundPosition: `0 -${offset}px`,
  };
  return (
    <div id="volume" style={style}>
      <Volume />
    </div>
  );
});

export default MainVolume;
