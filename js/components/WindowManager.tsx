import React, { ReactNode } from "react";
import { connect } from "react-redux";

import * as SnapUtils from "../snapUtils";
import * as Selectors from "../selectors";
import * as Actions from "../actionCreators";
import {
  WindowInfo,
  Dispatch,
  WindowPositions,
  AppState,
  WindowId,
} from "../types";
const abuts = (a: SnapUtils.Box, b: SnapUtils.Box) => {
  // TODO: This is kinda a hack. They should really be touching, not just within snapping distance.
  // Also, overlapping should not count.
  const wouldMoveTo = SnapUtils.snap(a, b);
  return wouldMoveTo.x !== undefined || wouldMoveTo.y !== undefined;
};

interface Props {
  container: HTMLElement;
  windowsInfo: WindowInfo[];
  browserWindowSize: { height: number; width: number };
  updateWindowPositions(positions: WindowPositions, center: boolean): void;
  getWindowHidden(windowId: WindowId): boolean;
  windows: { [windowId: string]: ReactNode };
  clearWindowFocus(): void;
}

class WindowManager extends React.Component<Props> {
  movingAndStationaryNodes(key: WindowId): [WindowInfo[], WindowInfo[]] {
    const windows = this.props.windowsInfo.filter(
      w =>
        this.props.windows[w.key] != null && !this.props.getWindowHidden(w.key)
    );
    const targetNode = windows.find(node => node.key === key);
    if (targetNode == null) {
      throw new Error(`Tried to move a node that does not exist: ${key}`);
    }

    let movingSet = new Set([targetNode]);
    // Only the main window brings other windows along.
    if (key === "main") {
      const findAllConnected = SnapUtils.traceConnection(abuts);
      movingSet = findAllConnected(windows, targetNode);
    }

    const stationary = windows.filter(w => !movingSet.has(w));
    const moving = Array.from(movingSet);

    return [moving, stationary];
  }

  handleMouseDown = (key: WindowId, e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).classList.contains("draggable")) {
      return;
    }

    if (this.props.getWindowHidden(key)) {
      // The user may be clicking on full screen Milkdrop.
      return;
    }

    const [moving, stationary] = this.movingAndStationaryNodes(key);

    const mouseStart = { x: e.clientX, y: e.clientY };
    const { browserWindowSize } = this.props;

    const box = SnapUtils.boundingBox(moving);

    const handleMouseMove = (ee: MouseEvent) => {
      const proposedDiff = {
        x: ee.clientX - mouseStart.x,
        y: ee.clientY - mouseStart.y,
      };

      const proposedWindows = moving.map(node => ({
        ...node,
        ...SnapUtils.applyDiff(node, proposedDiff),
      }));

      const proposedBox = {
        ...box,
        ...SnapUtils.applyDiff(box, proposedDiff),
      };

      const snapDiff = SnapUtils.snapDiffManyToMany(
        proposedWindows,
        stationary
      );

      const withinDiff = SnapUtils.snapWithinDiff(
        proposedBox,
        browserWindowSize
      );

      const finalDiff = SnapUtils.applyMultipleDiffs(
        proposedDiff,
        snapDiff,
        withinDiff
      );

      const windowPositionDiff = moving.reduce(
        (diff: { [windowId: string]: SnapUtils.Diff }, window) => {
          diff[window.key] = SnapUtils.applyDiff(window, finalDiff);
          return diff;
        },
        {}
      );

      this.props.updateWindowPositions(windowPositionDiff, false);
    };

    const removeListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", removeListeners);
    };

    window.addEventListener("mouseup", removeListeners);
    window.addEventListener("mousemove", handleMouseMove);
  };

  render() {
    const style: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
    };

    const windows = this.props.windowsInfo.filter(
      w => this.props.windows[w.key]
    );

    return windows.map(w => (
      <div
        key={w.key}
        onBlur={e => {
          const { currentTarget, relatedTarget } = e;
          if (
            currentTarget === relatedTarget ||
            currentTarget.contains(relatedTarget)
          ) {
            return;
          }
          this.props.clearWindowFocus();
        }}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          this.handleMouseDown(w.key, e);
        }}
        style={{ ...style, transform: `translate(${w.x}px, ${w.y}px)` }}
      >
        {this.props.windows[w.key]}
      </div>
    ));
  }
}

const mapStateToProps = (state: AppState) => ({
  windowsInfo: Selectors.getWindowsInfo(state),
  getWindowHidden: Selectors.getWindowHidden(state),
  getWindowOpen: Selectors.getWindowOpen(state),
  browserWindowSize: Selectors.getBrowserWindowSize(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    updateWindowPositions: (positions: WindowPositions) =>
      dispatch(Actions.updateWindowPositions(positions)),
    clearWindowFocus: () => dispatch(Actions.setFocusedWindow(null)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WindowManager);
