import { memo } from "react";

import * as Actions from "../../actionCreators";
import { useActionCreator, useSprite } from "../../hooks";

const Eject = memo(() => {
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  const spriteStyle = useSprite({
    base: "MAIN_EJECT_BUTTON",
    size: "MAIN_EJECT_BUTTON",
    active: "MAIN_EJECT_BUTTON_ACTIVE",
  });
  return (
    <div
      style={{ ...spriteStyle, position: "absolute", top: 89, left: 136 }}
      onClick={openMediaFileDialog}
      title="Open File(s)"
    />
  );
});

export default Eject;
