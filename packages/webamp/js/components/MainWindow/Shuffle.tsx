import { memo } from "react";
import classnames from "classnames";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import ContextMenuWrapper from "../ContextMenuWrapper";
import { Node } from "../ContextMenu";
import { useTypedSelector, useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

const Shuffle = memo(() => {
  const shuffle = useTypedSelector(Selectors.getShuffle);
  const handleClick = useActionCreator(Actions.toggleShuffle);
  return (
    <ContextMenuWrapper
      renderContents={() => (
        <Node
          checked={shuffle}
          label="Shuffle"
          onClick={handleClick}
          hotkey="(S)"
        />
      )}
    >
      <WinampButton
        id="shuffle"
        className={classnames({ selected: shuffle })}
        onClick={handleClick}
        title="Toggle Shuffle"
        requireClicksOriginateLocally={false}
      />
    </ContextMenuWrapper>
  );
});

export default Shuffle;
