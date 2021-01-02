import { WebampLazy, loadPresets } from "./Webamp";
import { useCallback } from "react";
// @ts-ignore
import iconLarge from "../images/manifest/icon-96x96.png";
// @ts-ignore
import iconSmall from "../images/manifest/icon-48x48.png";
import DesktopIcon from "./DesktopIcon";

const iconUrl = window.devicePixelRatio > 1 ? iconLarge : iconSmall;

interface Props {
  webamp: WebampLazy;
  preset: { url: string; name: string };
}

const MilkIcon = ({ webamp, preset }: Props) => {
  const onOpen = useCallback(() => {
    const statePreset = {
      type: "UNRESOLVED",
      name: preset.name,
      getPreset: async () => {
        const response = await fetch(preset.url);
        return response.json();
      },
    } as const;

    webamp.store.dispatch(loadPresets([statePreset]));
  }, [preset, webamp]);
  return (
    <DesktopIcon
      iconUrl={iconUrl}
      name={`${preset.name}.milk`}
      onOpen={onOpen}
    />
  );
};

export default MilkIcon;
