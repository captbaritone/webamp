import { WebampLazy } from "./Webamp";
// @ts-ignore
import iconSmall from "../images/icons/paint-file-32x32.png";
import DesktopIcon from "./DesktopIcon";
import { log } from "./logger";

const iconUrl = iconSmall;

interface Props {
  webamp: WebampLazy;
  skin: { url: string; name: string };
}

const SkinIcon = ({ webamp, skin }: Props) => {
  function onOpen() {
    log({ category: "SkinIcon", action: "click", label: skin.name });
    webamp.setSkinFromUrl(skin.url);
  }
  return (
    <DesktopIcon iconUrl={iconUrl} name={`${skin.name}.wsz`} onOpen={onOpen} />
  );
};

export default SkinIcon;
