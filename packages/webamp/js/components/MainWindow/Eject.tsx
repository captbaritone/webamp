import React from "react";

import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

const Eject = React.memo(() => {
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  return <div id="eject" onClick={openMediaFileDialog} title="Open File(s)" />;
});

export default Eject;
