// @ts-ignore #hook-types
import React, { useState } from "react";
import classnames from "classnames";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

interface Props extends DivProps {
  className?: string;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface State {
  clicked: boolean;
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
