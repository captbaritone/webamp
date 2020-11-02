import builtin from "../../../presets/builtin.json";
import * as Actions from "../../actionCreators";
import { Node, Parent, Hr } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { useActionCreator } from "../../hooks";

const PresetsContextMenu = () => {
  const openEqfFileDialog = useActionCreator(Actions.openEqfFileDialog);
  const downloadPreset = useActionCreator(Actions.downloadPreset);
  const setEqFromObject = useActionCreator(Actions.setEqFromObject);
  return (
    <ContextMenuTarget
      top
      id="presets-context"
      renderMenu={() => (
        <>
          <Parent label="Load">
            {builtin.presets.map((preset) => (
              <Node
                key={preset.name}
                onClick={() => setEqFromObject(preset)}
                label={preset.name}
              />
            ))}
            <Hr />
            <Node onClick={openEqfFileDialog} label="From Eqf..." />
          </Parent>
          <Node onClick={downloadPreset} label="Save" />
        </>
      )}
    >
      <div id="presets" />
    </ContextMenuTarget>
  );
};

export default PresetsContextMenu;
