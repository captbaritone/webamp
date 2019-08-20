import React from "react";
import ReactDOM from "react-dom";

const Desktop = React.memo(({ children }) => {
  const [desktopNode] = React.useState(() => document.createElement("div"));

  React.useEffect(() => {
    desktopNode.classList.add("webamp-desktop");
    document.body.appendChild(desktopNode);
    return () => {
      document.body.removeChild(desktopNode);
    };
  }, [desktopNode]);

  return ReactDOM.createPortal(children, desktopNode);
});

export default Desktop;
