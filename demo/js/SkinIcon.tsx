import WebampLazy from "../../js/webampLazy";
import React from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";
import DesktopIcon from "./DesktopIcon";

const iconUrl = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
  skin: { url: string; name: string };
}

const SkinIcon = ({ webamp, skin }: Props) => {
  function onOpen() {
    webamp.setSkinFromUrl(skin.url);
  }
  return <DesktopIcon iconUrl={iconUrl} name={skin.name} onOpen={onOpen} />;
};

export default SkinIcon;
