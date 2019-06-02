import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { VISUALIZERS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { AppState, TransitionType, Dispatch } from "../../types";
import {
  usePictureInPicture,
  useVideoFromCanvas,
} from "../../pictureInPicture";

type ButterchurnVisualizer = {
  setRendererSize(width: number, height: number): void;
  loadPreset(preset: Object, transitionTime: number): void;
  launchSongTitleAnim(title: string): void;
  render(): void;
};

interface StateProps {
  isEnabledVisualizer: boolean;
  playing: boolean;
  butterchurn: any;
  trackTitle: string | null;
  currentPreset: any;
  transitionType: TransitionType;
  message: {
    text: string;
    time: number;
  } | null;
  pictureInPicture: boolean;
}

interface DispatchProps {
  togglePictureInPicture(): void;
}

interface OwnProps {
  analyser: AnalyserNode;
  height: number;
  width: number;
}

type Props = StateProps & DispatchProps & OwnProps;

const TRANSITION_TYPE_DURATIONS = {
  [TransitionType.DEFAULT]: 2.7,
  [TransitionType.IMMEDIATE]: 0,
  [TransitionType.USER_PRESET]: 5.7,
};

function Visualizer(_props: Props) {
  const {
    butterchurn,
    analyser,
    width,
    height,
    currentPreset,
    transitionType,
    trackTitle,
    isEnabledVisualizer,
    message,
    playing,
    pictureInPicture,
    togglePictureInPicture,
  } = _props;
  const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null);
  const [visualizer, setVisualizer] = useState<ButterchurnVisualizer | null>(
    null
  );

  // Initialize the visualizer
  useEffect(() => {
    if (canvas == null || butterchurn == null) {
      return;
    }
    if (visualizer != null) {
      // Note: The visualizer does not offer anyway to clean itself up. So, we
      // don't offer any way to recreate it. So, if you swap out the analyser
      // node, or the canvas, that change won't be respected.
      return;
    }
    const _visualizer = butterchurn.createVisualizer(analyser.context, canvas, {
      width,
      height,
      meshWidth: 32,
      meshHeight: 24,
      pixelRatio: window.devicePixelRatio || 1,
    });
    _visualizer.connectAudio(analyser);
    // Picture-in-picture mode requires that the canvas contex already be established or it will
    // error. This forces that.
    _visualizer.render();
    setVisualizer(_visualizer);
  }, [canvas, butterchurn, analyser, height, width, visualizer]);

  // Ensure render size stays up to date
  useEffect(() => {
    if (visualizer == null) {
      return;
    }
    visualizer.setRendererSize(width, height);
  }, [visualizer, width, height]);

  // Load presets when they change
  const hasLoadedPreset = useRef<boolean>(false);
  useEffect(() => {
    if (visualizer == null || currentPreset == null) {
      return;
    }
    if (hasLoadedPreset.current) {
      visualizer.loadPreset(
        currentPreset,
        TRANSITION_TYPE_DURATIONS[transitionType]
      );
    } else {
      visualizer.loadPreset(
        currentPreset,
        TRANSITION_TYPE_DURATIONS[TransitionType.IMMEDIATE]
      );
      hasLoadedPreset.current = true;
    }
    // We don't want to trigger the transition if the transition type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizer, currentPreset]);

  // Handle title animations
  useEffect(() => {
    if (visualizer == null || !trackTitle) {
      return;
    }
    visualizer.launchSongTitleAnim(trackTitle);
  }, [visualizer, trackTitle]);

  const lastShownMessage = useRef<null | number>(null);

  useEffect(() => {
    if (visualizer == null || message == null) {
      return;
    }
    if (
      lastShownMessage.current == null ||
      message.time > lastShownMessage.current
    ) {
      lastShownMessage.current = Date.now();
      visualizer.launchSongTitleAnim(message.text);
    }
  }, [visualizer, message]);

  const shouldAnimate = playing && isEnabledVisualizer;

  // Kick off the animation loop
  useEffect(() => {
    if (!shouldAnimate || visualizer == null) {
      return;
    }
    let animationFrameRequest: number | null = null;
    const loop = () => {
      visualizer.render();
      animationFrameRequest = window.requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (animationFrameRequest != null) {
        window.cancelAnimationFrame(animationFrameRequest);
      }
    };
  }, [visualizer, shouldAnimate]);

  const handlePictureInPictureChange = React.useCallback(
    enabled => {
      if (enabled === pictureInPicture) {
        return;
      }
      togglePictureInPicture();
    },
    [pictureInPicture, togglePictureInPicture]
  );

  const video = useVideoFromCanvas({ canvas, playing, contextType: "webgl2" });

  usePictureInPicture({
    video,
    enabled: pictureInPicture,
    onChange: handlePictureInPictureChange,
  });

  return (
    <canvas
      id="milkdrop"
      height={height}
      width={width}
      style={{
        height: "100%",
        width: "100%",
        display: isEnabledVisualizer && !pictureInPicture ? "block" : "none",
      }}
      ref={setCanvas}
    />
  );
}

const mapStateToProps = (state: AppState): StateProps => ({
  isEnabledVisualizer:
    Selectors.getVisualizerStyle(state) === VISUALIZERS.MILKDROP,
  playing: Selectors.getMediaIsPlaying(state),
  butterchurn: Selectors.getButterchurn(state),
  trackTitle: Selectors.getCurrentTrackDisplayName(state),
  currentPreset: Selectors.getCurrentPreset(state),
  transitionType: Selectors.getPresetTransitionType(state),
  message: state.milkdrop.message,
  pictureInPicture: Selectors.getMilkdropPictureInPictureEnabled(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    togglePictureInPicture: () => dispatch(Actions.togglePictureInPicture()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Visualizer);
