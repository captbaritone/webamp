import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { BANDS, WINDOWS } from "../../constants";
import {
  setEqBand,
  setPreamp,
  setEqToMax,
  setEqToMid,
  setEqToMin,
  closeWindow,
  toggleEqualizerShadeMode,
} from "../../actionCreators";

import { getWindowShade } from "../../selectors";

import Band from "./Band";
import EqOn from "./EqOn";
import EqAuto from "./EqAuto";
import EqGraph from "./EqGraph";
import PresetsContextMenu from "./PresetsContextMenu";
import EqualizerShade from "./EqualizerShade";

import "../../../css/equalizer-window.css";
import { Dispatch, Band as BandType, AppState } from "../../types";
import FocusTarget from "../FocusTarget";

interface StateProps {
  doubled: boolean;
  selected: boolean;
  shade: boolean | undefined;
}

interface DispatchProps {
  setPreampValue(value: number): void;
  setEqToMin(): void;
  setEqToMid(): void;
  setEqToMax(): void;
  setHertzValue(hertz: BandType): (value: number) => void;
  closeEqualizerWindow(): void;
  toggleEqualizerShadeMode(): void;
}

const bandClassName = (band: BandType) => `band-${band}`;

const EqualizerWindow = (props: StateProps & DispatchProps) => {
  const { doubled, selected, shade } = props;

  const className = classnames({
    selected,
    doubled,
    shade,
    window: true,
    draggable: true,
  });
  return (
    <div id="equalizer-window" className={className}>
      <FocusTarget windowId={WINDOWS.EQUALIZER}>
        {props.shade ? (
          <EqualizerShade />
        ) : (
          <div>
            <div
              className="equalizer-top title-bar draggable"
              onDoubleClick={props.toggleEqualizerShadeMode}
            >
              <div
                id="equalizer-shade"
                onClick={props.toggleEqualizerShadeMode}
              />
              <div id="equalizer-close" onClick={props.closeEqualizerWindow} />
            </div>
            <EqOn />
            <EqAuto />
            <EqGraph />
            <PresetsContextMenu />
            <Band id="preamp" band="preamp" onChange={props.setPreampValue} />
            <div id="plus12db" onClick={props.setEqToMax} />
            <div id="zerodb" onClick={props.setEqToMid} />
            <div id="minus12db" onClick={props.setEqToMin} />
            {BANDS.map(hertz => (
              <Band
                key={hertz}
                id={bandClassName(hertz)}
                band={hertz}
                onChange={props.setHertzValue(hertz)}
              />
            ))}
          </div>
        )}
      </FocusTarget>
    </div>
  );
};

// This does not use the shorthand object syntax becuase `setHertzValue` needs
// to return a function.
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  setPreampValue: (value: number) => dispatch(setPreamp(value)),
  setEqToMin: () => dispatch(setEqToMin()),
  setEqToMid: () => dispatch(setEqToMid()),
  setEqToMax: () => dispatch(setEqToMax()),
  setHertzValue: (hertz: BandType) => (value: number) =>
    dispatch(setEqBand(hertz, value)),
  closeEqualizerWindow: () => dispatch(closeWindow("equalizer")),
  toggleEqualizerShadeMode: () => dispatch(toggleEqualizerShadeMode()),
});

const mapStateToProps = (state: AppState): StateProps => ({
  doubled: state.display.doubled,
  selected: state.windows.focused === WINDOWS.EQUALIZER,
  shade: getWindowShade(state)("equalizer"),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EqualizerWindow);
