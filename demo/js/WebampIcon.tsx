import WebampLazy from "../../js/webampLazy";
import React, { useEffect, useState } from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";
import DesktopIcon from "./DesktopIcon";
import { SHOW_DESKTOP_ICONS } from "./config";

const iconUrl = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
}

const WebampIcon = (props: Props) => {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    return props.webamp.onClose(() => {
      setHidden(false);
    });
  }, [props.webamp]);

  if (hidden && !SHOW_DESKTOP_ICONS) {
    return null;
  }

  function onOpen() {
    props.webamp.reopen();
    setHidden(true);
  }
  return <DesktopIcon iconUrl={iconUrl} name="Webamp" onOpen={onOpen} />;
};

export default WebampIcon;
