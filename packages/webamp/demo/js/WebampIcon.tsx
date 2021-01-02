import { WebampLazy } from "./Webamp";
import { useEffect, useState } from "react";
// @ts-ignore
import iconSmall from "../images/icons/winamp2-32x32.png";
import DesktopIcon from "./DesktopIcon";
import { SHOW_DESKTOP_ICONS } from "./config";

const iconUrl = iconSmall;

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
