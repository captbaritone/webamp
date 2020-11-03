import { useEffect, useState, useRef } from "react";
import classnames from "classnames";
import IconImage from "./IconImage";

interface Props {
  iconUrl: string;
  name: string;
  href: string;
}

const DesktopLinkIcon = ({ iconUrl, href, name }: Props) => {
  const ref = useRef<HTMLAnchorElement>(null);
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
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none" }}
      onDoubleClick={() => {
        setSelected(false);
      }}
      onClick={(e) => {
        if (!selected) {
          e.preventDefault();
        }
        setSelected(true);
      }}
      className={classnames("desktop-icon", { selected })}
    >
      <IconImage src={iconUrl} />
      <div className="desktop-icon-title">{name}</div>
    </a>
  );
};

export default DesktopLinkIcon;
