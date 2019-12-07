import WebampLazy from "../../js/webampLazy";
import React, { useEffect, useState, useRef } from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";

const icon = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
}

const WebampIcon = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    return props.webamp.onClose(() => {
      setHidden(false);
      setSelected(false);
    });
  }, [props.webamp]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const handleClick = (e: MouseEvent) => {
      if (ref.current != null && ref.current.contains(e.target as Element)) {
        return;
      }
      setSelected(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [selected]);

  if (hidden) {
    return null;
  }
  return (
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
      <img src={icon} style={{ width: 48, height: 48 }} />
      <div className="webamp-icon-title">Webamp</div>
    </div>
  );
};

export default WebampIcon;
