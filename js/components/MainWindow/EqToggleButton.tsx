import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { getWindowOpen } from "../../selectors";
import { toggleWindow } from "../../actionCreators";
import { AppState } from "../../types";

interface StateProps {
  windowOpen: boolean;
}

interface DispatchProps {
  handleClick(e: React.MouseEvent<HTMLDivElement>): void;
}

type Props = StateProps & DispatchProps;

const EqToggleButton = (props: Props) => (
  <div
    id="equalizer-button"
    className={classnames({ selected: props.windowOpen })}
    onClick={props.handleClick}
    title="Toggle Graphical Equalizer"
  />
);

const mapStateToProps = (state: AppState): StateProps => ({
  windowOpen: getWindowOpen(state)("equalizer"),
});

const mapDispatchToProps = {
  handleClick: () => toggleWindow("equalizer"),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EqToggleButton);
