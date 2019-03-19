import React from "react";
import { connect } from "react-redux";
import { getTrackDisplayName } from "../../selectors";
import { AppState } from "../../types";

interface OwnProps {
  id: number;
  paddedTrackNumber: string;
}

interface StateProps {
  title: string | null;
}

const TrackTitle = (props: OwnProps & StateProps) => (
  <span>
    {props.paddedTrackNumber}. {props.title}
  </span>
);

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => ({
  title: getTrackDisplayName(state)(ownProps.id),
});

export default connect(mapStateToProps)(TrackTitle);
