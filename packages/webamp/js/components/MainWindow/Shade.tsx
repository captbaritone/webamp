import { memo } from "react";
import ClickedDiv from "../ClickedDiv";

import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

const Shade = memo(() => {
  const handleClick = useActionCreator(Actions.toggleMainWindowShadeMode);
  return (
    <ClickedDiv
      id="shade"
      onMouseDown={handleClick}
      onDoubleClick={(e) => e.stopPropagation()}
      title="Toggle Windowshade Mode"
    />
  );
});

export default Shade;
