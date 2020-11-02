import * as Actions from "../../actionCreators";

import { Hr, Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { useActionCreator } from "../../hooks";

interface DispatchProps {
  sortListByTitle: () => void;
  reverseList: () => void;
  randomizeList: () => void;
}

/* eslint-disable no-alert */
/* TODO: This should really be kitty-corner to the upper right hand corner of the MiscMenu */
export default function SortContextMenu() {
  const reverseList = useActionCreator(Actions.reverseList);
  const randomizeList = useActionCreator(Actions.randomizeList);
  const sortListByTitle = useActionCreator(Actions.sortListByTitle);
  return (
    <ContextMenuTarget
      style={{ width: "100%", height: "100%" }}
      top
      renderMenu={() => (
        <>
          <Node label="Sort list by title" onClick={sortListByTitle} />
          <Hr />
          <Node label="Reverse list" onClick={reverseList} />
          <Node label="Randomize list" onClick={randomizeList} />
        </>
      )}
    >
      <div />
    </ContextMenuTarget>
  );
}
