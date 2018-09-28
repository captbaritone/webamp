import React, { ChangeEvent } from "react";
import { connect } from "react-redux";
import { setVolume } from "../actionCreators";

import { SET_FOCUS, UNSET_FOCUS } from "../actionTypes";
import { AppState, Dispatch } from "../types";
import * as Selectors from "../selectors";

interface Props {
  id?: string;
  volume: number;
  showMarquee(): void;
  hideMarquee(): void;
  setVolume(e: ChangeEvent<HTMLInputElement>): void;
  style?: React.CSSProperties;
  className?: string;
}

const Volume = (props: Props) => (
  <input
    id={props.id}
    type="range"
    min="0"
    max="100"
    step="1"
    value={props.volume}
    style={props.style}
    className={props.className}
    onChange={props.setVolume}
    onMouseDown={props.showMarquee}
    onMouseUp={props.hideMarquee}
    title="Volume Bar"
  />
);

const mapStateToProps = (state: AppState) => ({
  volume: Selectors.getVolume(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMarquee: () => dispatch({ type: SET_FOCUS, input: "volume" }),
  hideMarquee: () => dispatch({ type: UNSET_FOCUS }),
  setVolume: (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(setVolume(Number((e.target as HTMLInputElement).value)))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Volume);
