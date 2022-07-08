import { useState } from "react";
import classnames from "classnames";
import WinampButton from "./WinampButton";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

// Winamp has a strange behavior for the buttons at the top of the main window.
// It shows through to the main background sprite until the first time that it's
// clicked, and then it shows the dedicated undepressed sprite thereafter.
// This component is an abstraction that tracks if a div has ever been clicked.
// Look in `skinSelectors` for CSS selectors that look like `#some-id.clicked`
// for examples of this functionality in use.
function ClickedDiv(props: Props) {
  const [clicked, setClicked] = useState(false);
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setClicked(true);
    if (props.onPointerDown) {
      props.onPointerDown(e);
    }
  }
  return (
    <WinampButton
      {...props}
      className={classnames(props.className, { clicked })}
      onPointerDown={handlePointerDown}
    />
  );
}

export default ClickedDiv;
