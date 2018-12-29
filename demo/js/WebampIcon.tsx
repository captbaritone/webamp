import WebampLazy from "../../js/webampLazy";
// @ts-ignore #hook-types
import React, { useEffect, useState, useRef } from "react";
// @ts-ignore
import icon from "../images/manifest/icon-48x48.png";

interface Props {
  webamp: WebampLazy;
}

const WebampIcon = (props: Props) => {
  const ref = useRef();
  const [hidden, setHidden] = useState(true);
  const [selected, setSelected] = useState(false);
  useEffect(
    () => {
      return props.webamp.onClose(() => {
        setHidden(false);
        setSelected(false);
      });
    },
    [props.webamp]
  );

  useEffect(
    () => {
      if (!selected) {
        return;
      }
      const handleClick = (e: MouseEvent) => {
        if (ref.current.contains(e.target)) {
          return;
        } else {
          setSelected(false);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    },
    [selected]
  );
  return (
    hidden || (
      <div
        ref={ref}
        onDoubleClick={() => {
          props.webamp.reopen();
          setHidden(true);
          setSelected(false);
        }}
        onClick={() => setSelected(true)}
        className={selected ? "selected" : ""}
      >
        <img src={icon} />
        <div className="webamp-icon-title">Webamp</div>
      </div>
    )
  );
};

export default WebampIcon;
