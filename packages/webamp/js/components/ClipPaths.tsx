import { useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: { [id: string]: string[] };
};

// this.props.children should be an object containing arrays of strings. The
// keys are ids, and the arrays are arrays of polygon point strings
export default function ClipPaths({ children }: Props) {
  const paths = useMemo(() => {
    return document.createElement("div");
  }, []);

  useLayoutEffect(() => {
    document.body.appendChild(paths);
    return () => paths.remove();
  }, [paths]);

  return createPortal(
    <svg height={0} width={0}>
      <defs>
        {Object.keys(children).map((id) => (
          <clipPath id={id} key={id}>
            {children[id].map((points, i) => (
              <polygon points={points} key={i} />
            ))}
          </clipPath>
        ))}
      </defs>
    </svg>,
    paths
  );
}
