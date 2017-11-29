import React from "react";
import { connect } from "react-redux";
import { getTrackDisplayName } from "../../selectors";

const TrackTitle = props => <span>{props.title}</span>;

const mapStateToProps = (state, ownProps) => ({
  title: getTrackDisplayName(state, ownProps.id)
});

export default connect(mapStateToProps)(TrackTitle);
