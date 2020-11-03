import { memo } from "react";

import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

const Eject = memo(() => {
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  return <div id="eject" onClick={openMediaFileDialog} title="Open File(s)" />;
});

export default Eject;
