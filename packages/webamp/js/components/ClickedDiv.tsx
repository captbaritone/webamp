import { useState } from "react";
import classnames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// Winamp has a strange behavior for the buttons at the top of the main window.
// It shows through to the main background sprite until the first time that it's
// clicked, and then it shows the dedicated undepressed sprite thereafter.
// This component is an abstraction that tracks if a div has ever been clicked.
// Look in `skinSelectors` for CSS selectors that look like `#some-id.clicked`
// for examples of this functionality in use.
function ClickedDiv(props: Props) {
  const [clicked, setClicked] = useState(false);
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setClicked(true);
    if (props.onMouseDown) {
      props.onMouseDown(e);
    }
  }
  return (
    <div
      {...props}
      className={classnames(props.className, { clicked })}
      onMouseDown={handleMouseDown}
    />
  );
}

export default ClickedDiv;
