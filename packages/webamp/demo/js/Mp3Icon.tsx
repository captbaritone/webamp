import { WebampLazy, URLTrack } from "./Webamp";
import { useCallback } from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";
import DesktopIcon from "./DesktopIcon";

const iconUrl = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
  track: URLTrack;
}

const Mp3Icon = ({ webamp, track }: Props) => {
  const url = track.url.toString();
  const title = track.metaData?.title;

  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("text/json", JSON.stringify(track));
    },
    [track]
  );

  if (title == null) {
    console.warn(`Could not derive filename for ${url}`);
    return null;
  }
  function onOpen() {
    webamp.setTracksToPlay([track]);
  }

  return (
    <DesktopIcon
      iconUrl={iconUrl}
      name={`${title}.mp3`}
      onOpen={onOpen}
      onDragStart={onDragStart}
    />
  );
};

export default Mp3Icon;
