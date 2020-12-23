import Volume from "../Volume";
import Balance from "../Balance";
import { segment } from "../../utils";
import EqTitleButtons from "./EqTitleButtons";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { useTypedSelector, useActionCreator } from "../../hooks";

const EqualizerShade = () => {
  const volume = useTypedSelector(Selectors.getVolume);
  const balance = useTypedSelector(Selectors.getBalance);
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
      <EqTitleButtons />
      <Volume id="equalizer-volume" className={eqVolumeClassName} />
      <Balance id="equalizer-balance" className={eqBalanceClassName} />
    </div>
  );
};
export default EqualizerShade;
