import React, { useEffect, useState, useRef } from "react";
import classnames from "classnames";

interface Props {
  iconUrl: string;
  name: string;
  onOpen: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const DesktopIcon = ({ iconUrl, onOpen, name, onDragStart }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);

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

  return (
    <div
      ref={ref}
      onDoubleClick={() => {
        onOpen();
        setSelected(false);
      }}
      onClick={() => setSelected(true)}
      className={classnames("desktop-icon", { selected })}
      onDragStart={onDragStart}
    >
      <img src={iconUrl} style={{ width: 48, height: 48 }} />
      <div className="desktop-icon-title">{name}</div>
    </div>
  );
};

export default DesktopIcon;
