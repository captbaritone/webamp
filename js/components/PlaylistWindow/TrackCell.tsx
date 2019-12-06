import React, { useCallback, ReactNode } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import {
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  SHIFT_CLICKED_TRACK,
  PLAY_TRACK,
} from "../../actionTypes";
import * as Selectors from "../../selectors";
import { AppState, Dispatch, PlaylistStyle } from "../../types";

interface OwnProps {
  id: number;
  index: number;
  handleMoveClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

interface StateProps {
  selected: boolean;
  current: boolean;
  skinPlaylistStyle: PlaylistStyle;
}

interface DispatchProps {
  shiftClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  ctrlClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  click: () => void;
  onDoubleClick: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;
function TrackCell({
  skinPlaylistStyle,
  selected,
  current,
  children,
  shiftClick,
  ctrlClick,
  onDoubleClick,
  handleMoveClick,
  click,
}: Props) {
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.shiftKey) {
        shiftClick(e);
        return;
      } else if (e.metaKey || e.ctrlKey) {
        ctrlClick(e);
        return;
      }

      if (!selected) {
        click();
      }

      handleMoveClick(e);
    },
    [click, ctrlClick, shiftClick, handleMoveClick, selected]
  );

  const style: React.CSSProperties = {
    backgroundColor: selected ? skinPlaylistStyle.selectedbg : undefined,
    color: current ? skinPlaylistStyle.current : undefined,
  };
  return (
    <div
      className={classnames("track-cell", { selected, current })}
      style={style}
      onClick={e => e.stopPropagation()}
      onMouseDown={onMouseDown}
      onContextMenu={e => e.preventDefault()}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    skinPlaylistStyle: Selectors.getSkinPlaylistStyle(state),
    selected: Selectors.getSelectedTrackIds(state).has(ownProps.id),
    current: Selectors.getCurrentTrackId(state) === ownProps.id,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: OwnProps
): DispatchProps => ({
  shiftClick: e => {
    e.preventDefault();
    return dispatch({ type: SHIFT_CLICKED_TRACK, index: ownProps.index });
  },
  ctrlClick: e => {
    e.preventDefault();
    return dispatch({ type: CTRL_CLICKED_TRACK, index: ownProps.index });
  },
  click: () => dispatch({ type: CLICKED_TRACK, index: ownProps.index }),
  onDoubleClick: () => dispatch({ type: PLAY_TRACK, id: ownProps.id }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackCell);
