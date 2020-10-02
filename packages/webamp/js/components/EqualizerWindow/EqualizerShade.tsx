import React from "react";
import Volume from "../Volume";
import Balance from "../Balance";
import { segment } from "../../utils";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { useTypedSelector, useActionCreator } from "../../hooks";

const EqualizerShade = () => {
  const volume = useTypedSelector(Selectors.getVolume);
  const balance = useTypedSelector(Selectors.getBalance);
  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleEqualizerShadeMode = useActionCreator(
    Actions.toggleEqualizerShadeMode
  );

  const classes = ["left", "center", "right"];
  const eqVolumeClassName = segment(0, 100, volume, classes);
  const eqBalanceClassName = segment(-100, 100, balance, classes);
  return (
    <div
      className="draggable"
      onDoubleClick={toggleEqualizerShadeMode}
      style={{ width: "100%", height: "100%" }}
    >
      <div id="equalizer-shade" onClick={toggleEqualizerShadeMode} />
      <div id="equalizer-close" onClick={() => closeWindow("equalizer")} />
      <Volume
        id="equalizer-volume"
        style={{ background: "none" }}
        className={eqVolumeClassName}
      />
      <Balance
        style={{ background: "none" }}
        id="equalizer-balance"
        className={eqBalanceClassName}
      />
    </div>
  );
};
export default EqualizerShade;
