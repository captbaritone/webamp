import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { VISUALIZERS } from "../../constants";
import * as Selectors from "../../selectors";
import { AppState, TransitionType } from "../../types";

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
}

interface OwnProps {
  analyser: AnalyserNode;
  height: number;
  width: number;
}

type Props = StateProps & OwnProps;

const TRANSITION_TYPE_DURATIONS = {
  [TransitionType.DEFAULT]: 2.7,
  [TransitionType.IMMEDIATE]: 0,
  [TransitionType.USER_PRESET]: 5.7
};

function Visualizer(props: Props) {
  const canvasRef = useRef(null);
  const [visualizer, setVisualizer] = useState<ButterchurnVisualizer | null>(
    null
  );

  // Initialize the visualizer
  useEffect(() => {
    if (canvasRef.current == null || props.butterchurn == null) {
      return;
    }
    if (visualizer != null) {
      // Note: The visualizer does not offer anyway to clean itself up. So, we
      // don't offer any way to recreate it. So, if you swap out the analyser
      // node, or the canvas, that change won't be respected.
      return;
    }
    const _visualizer = props.butterchurn.createVisualizer(
      props.analyser.context,
      canvasRef.current,
      {
        width: props.width,
        height: props.height,
        meshWidth: 32,
        meshHeight: 24,
        pixelRatio: window.devicePixelRatio || 1
      }
    );
    _visualizer.connectAudio(props.analyser);
    setVisualizer(_visualizer);
  }, [canvasRef.current, props.butterchurn, props.analyser]);

  // Ensure render size stays up to date
  useEffect(() => {
    if (visualizer == null) {
      return;
    }
    visualizer.setRendererSize(props.width, props.height);
  }, [visualizer, props.width, props.height]);

  // Load presets when they change
  useEffect(() => {
    if (visualizer == null || props.currentPreset == null) {
      return;
    }
    visualizer.loadPreset(
      props.currentPreset,
      TRANSITION_TYPE_DURATIONS[props.transitionType]
    );
  }, [visualizer, props.currentPreset]);

  // Handle title animations
  useEffect(() => {
    if (visualizer == null || !props.trackTitle) {
      return;
    }
    visualizer.launchSongTitleAnim(props.trackTitle);
  }, [visualizer, props.trackTitle]);

  const shouldAnimate = props.playing && props.isEnabledVisualizer;

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

  return (
    <canvas
      height={props.height}
      width={props.width}
      style={{
        height: "100%",
        width: "100%",
        display: props.isEnabledVisualizer ? "block" : "none"
      }}
      ref={canvasRef}
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
  transitionType: Selectors.getPresetTransitionType(state)
});

export default connect(mapStateToProps)(Visualizer);
