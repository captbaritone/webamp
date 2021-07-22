import * as React from "react";
import classnames from "classnames";
import { WINDOWS, MEDIA_STATUS, LOAD_STYLE } from "../../constants";
import * as Actions from "../../actionCreators";

import DropTarget from "../DropTarget";
import MiniTime from "../MiniTime";

import ClickedDiv from "../ClickedDiv";
import ContextMenuTarget from "../ContextMenuTarget";
import Visualizer from "../Visualizer";
import ActionButtons from "./ActionButtons";
import MainBalance from "./MainBalance";
import Close from "./Close";
import ClutterBar from "./ClutterBar";
import MainContextMenu from "./MainContextMenu";
import Eject from "./Eject";
import EqToggleButton from "./EqToggleButton";
import PlaylistToggleButton from "./PlaylistToggleButton";
import Kbps from "./Kbps";
import Khz from "./Khz";
import Marquee from "./Marquee";
import MonoStereo from "./MonoStereo";
import Position from "./Position";
import Repeat from "./Repeat";
import Shade from "./Shade";
import Minimize from "./Minimize";
import Shuffle from "./Shuffle";
import Time from "./Time";
import MainVolume from "./MainVolume";
import * as Selectors from "../../selectors";

import "../../../css/main-window.css";
import { FilePicker } from "../../types";
import FocusTarget from "../FocusTarget";
import { useActionCreator, useTypedSelector } from "../../hooks";

interface Props {
  analyser: AnalyserNode;
  filePickers: FilePicker[];
}

function loadMediaAndPlay(e: React.DragEvent<HTMLDivElement>) {
  return Actions.loadMedia(e, LOAD_STYLE.PLAY);
}

const MainWindow = React.memo(({ analyser, filePickers }: Props) => {
  const mainShade = useTypedSelector(Selectors.getWindowShade)("main");
  const status = useTypedSelector(Selectors.getMediaStatus);
  const focused = useTypedSelector(Selectors.getFocusedWindow);
  const loading = useTypedSelector(Selectors.getLoading);
  const doubled = useTypedSelector(Selectors.getDoubled);
  const llama = useTypedSelector(Selectors.getLlamaMode);
  const working = useTypedSelector(Selectors.getWorking);

  const className = classnames({
    window: true,
    play: status === MEDIA_STATUS.PLAYING,
    stop: status === MEDIA_STATUS.STOPPED,
    pause: status === MEDIA_STATUS.PAUSED,
    selected: focused === WINDOWS.MAIN,
    shade: mainShade,
    draggable: true,
    loading,
    doubled,
    llama,
  });

  const toggleMainWindowShadeMode = useActionCreator(
    Actions.toggleMainWindowShadeMode
  );
  const scrollVolume = useActionCreator(Actions.scrollVolume);
  const loadMedia = useActionCreator(loadMediaAndPlay);

  return (
    <DropTarget
      id="main-window"
      windowId={WINDOWS.MAIN}
      className={className}
      handleDrop={loadMedia}
      onWheel={scrollVolume}
    >
      <FocusTarget windowId={WINDOWS.MAIN}>
        <div
          id="title-bar"
          className="selected draggable"
          onDoubleClick={toggleMainWindowShadeMode}
        >
          <ContextMenuTarget
            id="option-context"
            bottom
            renderMenu={() => <MainContextMenu filePickers={filePickers} />}
          >
            <ClickedDiv id="option" title="Winamp Menu" />
          </ContextMenuTarget>
          {mainShade && <MiniTime />}
          <Minimize />
          <Shade />
          <Close />
        </div>
        <div className="webamp-status">
          <ClutterBar />
          {!working && <div id="play-pause" />}
          <div
            id="work-indicator"
            className={classnames({ selected: working })}
          />
          <Time />
        </div>
        <Visualizer
          // @ts-ignore Visualizer is not typed yet
          analyser={analyser}
        />
        <div className="media-info">
          <Marquee />
          <Kbps />
          <Khz />
          <MonoStereo />
        </div>
        <MainVolume />
        <MainBalance />
        <div className="windows">
          <EqToggleButton />
          <PlaylistToggleButton />
        </div>
        <Position />
        <ActionButtons />
        <Eject />
        <div className="shuffle-repeat">
          <Shuffle />
          <Repeat />
        </div>
        <a
          id="about"
          target="_blank"
          href="https://webamp.org/about"
          title="About"
        />
      </FocusTarget>
    </DropTarget>
  );
});

export default MainWindow;
