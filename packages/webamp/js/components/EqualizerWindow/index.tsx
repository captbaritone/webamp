import { useState } from "react";
import classnames from "classnames";

import { BANDS, WINDOWS } from "../../constants";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";

import Band from "./Band";
import EqOn from "./EqOn";
import EqAuto from "./EqAuto";
import EqGraph from "./EqGraph";
import PresetsContextMenu from "./PresetsContextMenu";
import EqualizerShade from "./EqualizerShade";

import { Band as BandType } from "../../types";
import FocusTarget from "../FocusTarget";
import { useTypedSelector, useActionCreator } from "../../hooks";
import EqTitleButtons from "./EqTitleButtons";

const bandClassName = (band: BandType) => `band-${band}`;

const EqualizerWindow = () => {
  const doubled = useTypedSelector(Selectors.getDoubled);
  const focusedWindow = useTypedSelector(Selectors.getFocusedWindow);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);

  const selected = focusedWindow === WINDOWS.EQUALIZER;
  const shade = getWindowShade(WINDOWS.EQUALIZER);

  const setPreampValue = useActionCreator(Actions.setPreamp);
  const setEqToMin = useActionCreator(Actions.setEqToMin);
  const setEqToMid = useActionCreator(Actions.setEqToMid);
  const setEqToMax = useActionCreator(Actions.setEqToMax);
  const setHertzValue = useActionCreator(Actions.setEqBand);
  const toggleEqualizerShadeMode = useActionCreator(
    Actions.toggleEqualizerShadeMode
  );

  const className = classnames({
    selected,
    doubled,
    shade,
    window: true,
    draggable: true,
  });

  // Track whether the click originated in the "hertz" area of the EQ
  // We only want to allow drag across the EQ when the click originated in that area
  const [clickOriginatedInEq, setClickOriginatedInEq] = useState(false);

  const onPointerDownHz = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Release the pointer capture
    // https://w3c.github.io/pointerevents/#implicit-pointer-capture
    // https://w3c.github.io/pointerevents/#pointer-capture
    const target = e.target as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);

    setClickOriginatedInEq(true);

    function onReleaseHz(ee: PointerEvent) {
      // Release only if it is the actual pointer release, not the simulated one coming from WinampButton
      // Simulated pointer release coming from WinampButton has ee.detail == -42
      // Actual pointer release here will come in as ee.detail === 0
      if (ee.detail === 0) {
        setClickOriginatedInEq(false);
        document.removeEventListener("pointerup", onReleaseHz);
      }
    }
    document.addEventListener("pointerup", onReleaseHz);
  };

  return (
    <div id="equalizer-window" className={className}>
      <FocusTarget windowId={WINDOWS.EQUALIZER}>
        {shade ? (
          <EqualizerShade />
        ) : (
          <div>
            <div
              className="equalizer-top title-bar draggable"
              onDoubleClick={toggleEqualizerShadeMode}
            >
              <EqTitleButtons />
            </div>
            <EqOn />
            <EqAuto />
            <EqGraph />
            <PresetsContextMenu />
            <Band id="preamp" band="preamp" onChange={setPreampValue} />
            <div id="plus12db" onClick={setEqToMax} />
            <div id="zerodb" onClick={setEqToMid} />
            <div id="minus12db" onClick={setEqToMin} />
            <div onPointerDown={onPointerDownHz}>
              {BANDS.map((hertz) => (
                <Band
                  key={hertz}
                  id={bandClassName(hertz)}
                  band={hertz}
                  onChange={(value) => setHertzValue(hertz, value)}
                  clickOriginatedInEq={clickOriginatedInEq}
                />
              ))}
            </div>
          </div>
        )}
      </FocusTarget>
    </div>
  );
};
export default EqualizerWindow;
