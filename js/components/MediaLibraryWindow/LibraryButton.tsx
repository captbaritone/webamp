import React from "react";
type Props = React.HTMLAttributes<HTMLDivElement>;

// TODO: This should be a `<button>` but I couldn't figure out how to style it with css grid
const LibraryButton = (props: Props) => {
  const { children, ...passThroughProps } = props;
  return (
    <div className="library-button" {...passThroughProps}>
      <span className="library-button-left" />
      <span className="library-button-center">{children}</span>
      <span className="library-button-right" />
    </div>
  );
};

export default LibraryButton;
