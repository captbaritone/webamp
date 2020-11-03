import ResizeTarget from "../ResizeTarget";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { useTypedSelector, useActionCreator } from "../../hooks";

type Props = {
  widthOnly?: boolean;
};

function PlaylistResizeTarget({ widthOnly }: Props) {
  const windowSize = useTypedSelector(Selectors.getWindowSize);
  const setWindowSize = useActionCreator(Actions.setWindowSize);
  const currentSize = windowSize("playlist");

  return (
    <ResizeTarget
      currentSize={currentSize}
      id="playlist-resize-target"
      setWindowSize={(size) => {
        setWindowSize("playlist", size);
      }}
      widthOnly={widthOnly}
    />
  );
}
export default PlaylistResizeTarget;
