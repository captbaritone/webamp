import WebampLazy from "../../js/webampLazy";
import React from "react";
import WebampIcon from "./WebampIcon";
import Mp3Icon from "./Mp3Icon";
import SkinIcon from "./SkinIcon";
import { defaultInitialTracks, SHOW_DESKTOP_ICONS } from "./config";
import { useWindowSize } from "../../js/hooks";
import avaliableSkins from "./avaliableSkins";

interface Props {
  webamp: WebampLazy;
}

const ICON_WIDTH = 100;
const ICON_HEIGHT = 100;
const VERTICAL_MARGIN = 30;
const HORIZONTAL_MARGIN = 10;

const DemoDesktop = ({ webamp }: Props) => {
  const { width } = useWindowSize();
  const visibleWidth = width - VERTICAL_MARGIN * 2;

  const columns = Math.floor(visibleWidth / ICON_WIDTH);

  const icons = [<WebampIcon webamp={webamp} />];

  if (SHOW_DESKTOP_ICONS) {
    icons.push(
      ...defaultInitialTracks.map((track) => {
        return <Mp3Icon webamp={webamp} track={track} />;
      }),
      ...avaliableSkins.map((skin) => {
        return <SkinIcon webamp={webamp} skin={skin} />;
      })
    );
  }
  return (
    <div
      id="desktop"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: VERTICAL_MARGIN,
        marginLeft: HORIZONTAL_MARGIN,
      }}
    >
      {icons.map((icon, i) => {
        const row = Math.floor(i / columns);
        const column = i % columns;
        return (
          <div
            key={i}
            style={{
              left: column * ICON_WIDTH,
              top: row * ICON_HEIGHT,
              width: ICON_WIDTH,
              position: "absolute",
            }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
};

export default DemoDesktop;
