import { createPortal } from "react-dom";
import { useMemo, useLayoutEffect } from "react";

type Props = {
  children: string;
  id: string;
};

export default function Css({ children, id }: Props) {
  const style = useMemo(() => {
    const s = document.createElement("style");
    s.type = "text/css";
    s.id = id;
    return s;
  }, [id]);

  useLayoutEffect(() => {
    document.head.appendChild(style);
    return () => style.remove();
  }, [style]);

  return createPortal(children, style);
}
