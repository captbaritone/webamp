import React from "react";
import { connect } from "react-redux";
import builtin from "../../../presets/builtin.json";
import {
  openEqfFileDialog,
  downloadPreset,
  setEqFromObject,
} from "../../actionCreators";
import { Node, Parent, Hr } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { Dispatch, EqfPreset } from "../../types";

interface DispatchProps {
  openEqfFileDialog(): void;
  downloadPreset(): void;
  setEqFromObject(preset: EqfPreset): void;
}

const PresetsContextMenu = (props: DispatchProps) => (
  <ContextMenuTarget
    top
    id="presets-context"
    renderMenu={() => (
      <>
        <Parent label="Load">
          {builtin.presets.map(preset => (
            <Node
              key={preset.name}
              onClick={() => props.setEqFromObject(preset)}
              label={preset.name}
            />
          ))}
          <Hr />
          <Node onClick={props.openEqfFileDialog} label="From Eqf..." />
        </Parent>
        <Node onClick={props.downloadPreset} label="Save" />
      </>
    )}
  >
    <div id="presets" />
  </ContextMenuTarget>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    openEqfFileDialog: () => dispatch(openEqfFileDialog()),
    downloadPreset: () => dispatch(downloadPreset()),
    setEqFromObject: preset => dispatch(setEqFromObject(preset)),
  };
};

export default connect(null, mapDispatchToProps)(PresetsContextMenu);
