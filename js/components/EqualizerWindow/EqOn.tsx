import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { toggleEq } from "../../actionCreators";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  on: boolean;
}

interface DispatchProps {
  toggleEq(): void;
}

const EqOn = (props: StateProps & DispatchProps) => {
  return (
    <div
      id="on"
      className={classnames({
        selected: props.on,
      })}
      onClick={props.toggleEq}
    />
  );
};

const mapStateToProps = (state: AppState): StateProps => ({
  on: state.equalizer.on,
});

const mapDispatchProps = (dispatch: Dispatch): DispatchProps => {
  return { toggleEq: () => dispatch(toggleEq()) };
};

export default connect(
  mapStateToProps,
  mapDispatchProps
)(EqOn);
