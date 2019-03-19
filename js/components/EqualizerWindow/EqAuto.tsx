import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { SET_EQ_AUTO } from "../../actionTypes";
import { Dispatch, AppState } from "../../types";

interface StateProps {
  auto: boolean;
}

interface DispatchProps {
  toggleAuto(): void;
}

const EqAuto = (props: StateProps & DispatchProps) => {
  const className = classnames({ selected: props.auto });
  return <div id="auto" className={className} onClick={props.toggleAuto} />;
};

const mapStateToProps = (state: AppState): StateProps => {
  return { auto: state.equalizer.auto };
};
const mapDispatchToProps = () => (dispatch: Dispatch): DispatchProps => {
  // We don't support auto.
  return {
    toggleAuto: () => dispatch({ type: SET_EQ_AUTO, value: false }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EqAuto);
