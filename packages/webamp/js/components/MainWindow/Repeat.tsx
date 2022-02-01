import { memo } from "react";
import classnames from "classnames";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";
import { useTypedSelector, useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

const Repeat = memo(() => {
  const repeat = useTypedSelector(Selectors.getRepeat);
  const handleClick = useActionCreator(Actions.toggleRepeat);
  return (
    <ContextMenuWraper
      renderContents={() => (
        <Node
          checked={repeat}
          label="Repeat"
          onClick={handleClick}
          hotkey="(R)"
        />
      )}
    >
      <WinampButton
        id="repeat"
        className={classnames({ selected: repeat })}
        onClick={handleClick}
        title="Toggle Repeat"
      />
    </ContextMenuWraper>
  );
});

export default Repeat;
