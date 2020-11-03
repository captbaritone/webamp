import { memo } from "react";
import classnames from "classnames";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

const MonoStereo = memo(() => {
  const channels = useTypedSelector(Selectors.getChannels);
  return (
    <div className="mono-stereo">
      <div id="stereo" className={classnames({ selected: channels === 2 })} />
      <div id="mono" className={classnames({ selected: channels === 1 })} />
    </div>
  );
});

export default MonoStereo;
