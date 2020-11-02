import { memo } from "react";
import classnames from "classnames";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import ContextMenuWraper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";
import { useTypedSelector, useActionCreator } from "../../hooks";

const Shuffle = memo(() => {
  const shuffle = useTypedSelector(Selectors.getShuffle);
  const handleClick = useActionCreator(Actions.toggleShuffle);
  return (
    <ContextMenuWraper
      renderContents={() => (
        <Node
          checked={shuffle}
          label="Shuffle"
          onClick={handleClick}
          hotkey="(S)"
        />
      )}
    >
      <div
        id="shuffle"
        className={classnames({ selected: shuffle })}
        onClick={handleClick}
        title="Toggle Shuffle"
      />
    </ContextMenuWraper>
  );
});

export default Shuffle;
