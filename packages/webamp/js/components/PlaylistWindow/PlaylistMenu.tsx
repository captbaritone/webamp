import { Children, memo, useState, ReactNode, useCallback } from "react";
import classnames from "classnames";
import { useOnClickAway } from "../../hooks";

import PlaylistMenuEnry from "./PlaylistMenuEntry";

interface Props {
  id: string;
  children: ReactNode | Array<ReactNode>;
}

interface State {
  selected: boolean;
}

function PlaylistMenu(props: Props) {
  const [selected, setSelected] = useState(false);

  const [ref, setRef] = useState<Element | null>(null);

  const callback = useCallback(() => {
    // If we've clicked on a Context Menu spawed inside this menu, it will
    // register as an external click. However, hiding the menu will remove
    // the Context Menu from the DOM. Therefore, we wait until the next
    // event loop to actually hide ourselves.
    setTimeout(() => {
      // Close the menu
      setSelected(false);
    }, 0);
  }, []);

  useOnClickAway(ref, selected ? callback : null);

  return (
    <div
      id={props.id}
      className={classnames("playlist-menu", {
        selected,
      })}
      ref={setRef}
      onClick={() => setSelected((selected_) => !selected_)}
    >
      <div className="bar" />
      {selected && (
        <ul>
          {Children.map(props.children, (child, i) => (
            <PlaylistMenuEnry key={i}>{child}</PlaylistMenuEnry>
          ))}
        </ul>
      )}
    </div>
  );
}
export default memo(PlaylistMenu);
