import { memo, ReactNode } from "react";
import classnames from "classnames";
import { useIsHovered } from "../../hooks";

interface Props {
  children: ReactNode;
}

// We implement hover ourselves, because we hate ourselves and https://stackoverflow.com/a/13259049/1263117
function PlaylistMenuEntry({ children }: Props) {
  const { ref, hover } = useIsHovered();
  return (
    <li ref={ref} className={classnames({ hover })}>
      {children}
    </li>
  );
}

export default memo(PlaylistMenuEntry);
