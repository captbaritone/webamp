import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { TRACK_HEIGHT } from "../../constants";
import {
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  SHIFT_CLICKED_TRACK,
  PLAY_TRACK
} from "../../actionTypes";
import { dragSelected } from "../../actionCreators";
import { getCurrentTrackId } from "../../selectors";

class TrackCell extends React.Component {
  constructor(props) {
    super(props);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  _onMouseDown(e) {
    if (e.shiftKey) {
      this.props.shiftClick(e);
      return;
    } else if (e.metaKey || e.ctrlKey) {
      this.props.ctrlClick(e);
      return;
    }

    if (!this.props.selected) {
      this.props.click(e);
    }

    const mouseStart = e.clientY;
    let lastDiff = 0;
    const handleMouseMove = ee => {
      const proposedDiff = Math.floor((ee.clientY - mouseStart) / TRACK_HEIGHT);
      if (proposedDiff !== lastDiff) {
        const diffDiff = proposedDiff - lastDiff;
        this.props.dragSelected(diffDiff);
        lastDiff = proposedDiff;
      }
    };

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMove);
    });
    window.addEventListener("mousemove", handleMouseMove);
  }

  render() {
    const {
      skinPlaylistStyle,
      selected,
      current,
      children,
      onDoubleClick
    } = this.props;
    const style = {
      backgroundColor: selected ? skinPlaylistStyle.selectedbg : null,
      color: current ? skinPlaylistStyle.current : null
    };
    return (
      <div
        className={classnames({ selected, current })}
        style={style}
        onClick={e => e.stopPropagation()}
        onMouseDown={this._onMouseDown}
        onContextMenu={e => e.preventDefault()}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { display: { skinPlaylistStyle }, playlist: { tracks } } = state;
  const current = getCurrentTrackId(state) === ownProps.id;
  const track = tracks[ownProps.id];
  return { skinPlaylistStyle, selected: track.selected, current };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  shiftClick: e => {
    e.preventDefault();
    return dispatch({ type: SHIFT_CLICKED_TRACK, index: ownProps.index });
  },
  ctrlClick: e => {
    e.preventDefault();
    return dispatch({ type: CTRL_CLICKED_TRACK, index: ownProps.index });
  },
  click: () => dispatch({ type: CLICKED_TRACK, index: ownProps.index }),
  dragSelected: offset => dispatch(dragSelected(offset)),
  onDoubleClick: () => dispatch({ type: PLAY_TRACK, id: ownProps.id })
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackCell);
