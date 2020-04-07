import WebampLazy from "../../js/webampLazy";
import React from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";
import DesktopIcon from "./DesktopIcon";
import { URLTrack } from "../../js/types";

const iconUrl = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
  track: URLTrack;
}

const Mp3Icon = ({ webamp, track }: Props) => {
  const url = track.url.toString();
  const segments = url.toString().split("/");
  const filename = segments.pop();
  if (filename == null) {
    console.warn(`Could not derive filename for ${url}`);
    return null;
  }
  function onOpen() {
    webamp.setTracksToPlay([track]);
  }
  return <DesktopIcon iconUrl={iconUrl} name={filename} onOpen={onOpen} />;
};

export default Mp3Icon;
