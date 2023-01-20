import { memo } from "react";

import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

const Eject = memo(() => {
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  return (
    <WinampButton
      id="eject"
      onClick={openMediaFileDialog}
      title="Open File(s)"
    />
  );
});

export default Eject;
