import { useEffect, useState, useRef } from "react";
import { VISUALIZERS } from "../../constants";
import * as Selectors from "../../selectors";
import { TransitionType } from "../../types";
import { useTypedSelector } from "../../hooks";
import { createFlashGovernor } from "./flashGovernor";

type ButterchurnVisualizer = {
  setRendererSize(width: number, height: number): void;
  loadPreset(preset: Object, transitionTime: number): void;
  launchSongTitleAnim(title: string): void;
  render(): void;
};

interface Props {
  analyser: AnalyserNode;
  height: number;
  width: number;
}

const TRANSITION_TYPE_DURATIONS = {
  [TransitionType.DEFAULT]: 2.7,
  [TransitionType.IMMEDIATE]: 0,
  [TransitionType.USER_PRESET]: 5.7,
};

function Visualizer({ analyser, width, height }: Props) {
  const visualizerStyle = useTypedSelector(Selectors.getVisualizerStyle);
  const playing = useTypedSelector(Selectors.getMediaIsPlaying);
  const butterchurn = useTypedSelector(Selectors.getButterchurn);
  const trackTitle = useTypedSelector(Selectors.getCurrentTrackDisplayName);
  const currentPreset = useTypedSelector(Selectors.getCurrentPreset);
  const transitionType = useTypedSelector(Selectors.getPresetTransitionType);
  const message = useTypedSelector(Selectors.getMilkdropMessage);
  const reduceFlashing = useTypedSelector(Selectors.getReduceFlashing);

  const isEnabledVisualizer = visualizerStyle === VISUALIZERS.MILKDROP;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const governorRef = useRef(createFlashGovernor());
  const [isDamping, setIsDamping] = useState<boolean>(false);
  const [visualizer, setVisualizer] = useState<ButterchurnVisualizer | null>(
    null
  );

  // Initialize the visualizer
  useEffect(() => {
    if (canvasRef.current == null || butterchurn == null) {
      return;
    }
    if (visualizer != null) {
      // Note: The visualizer does not offer anyway to clean itself up. So, we
      // don't offer any way to recreate it. So, if you swap out the analyser
      // node, or the canvas, that change won't be respected.
      return;
    }
    const _visualizer = butterchurn.createVisualizer(
      analyser.context,
      canvasRef.current,
      {
        width,
        height,
        meshWidth: 32,
        meshHeight: 24,
        pixelRatio: window.devicePixelRatio || 1,
        // Webamp may support rendering Milkdrop presets from untrusted sources.
        // By using `onlyUseWASM` here we instruct Butterchurn not to `eval`
        // JavaScript code included in older Butterchurn preset `.json` files.
        // https://jordaneldredge.com/blog/speeding-up-winamps-music-visualizer-with-webassembly/#security
        onlyUseWASM: true,
      }
    );
    _visualizer.connectAudio(analyser);
    setVisualizer(_visualizer);
  }, [butterchurn, analyser, height, width, visualizer]);

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
    governorRef.current.reset();
    setIsDamping(false);
    if (canvasRef.current) {
      canvasRef.current.style.filter = "";
    }

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
      if (canvas) {
        canvas.style.filter = "";
      }
      setIsDamping(false);
      return;
    }
    const canvas = canvasRef.current;
    let animationFrameRequest: number | null = null;
    const loop = () => {
      visualizer.render();

      if (reduceFlashing && canvasRef.current) {
        const decision = governorRef.current.tick(
          canvasRef.current,
          performance.now()
        );
        canvasRef.current.style.filter = decision.isDamping
          ? `brightness(${decision.scale.toFixed(3)})`
          : "";
        setIsDamping(decision.isDamping);
      } else if (canvasRef.current && canvasRef.current.style.filter !== "") {
        canvasRef.current.style.filter = "";
        setIsDamping(false);
      }

      animationFrameRequest = window.requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (animationFrameRequest != null) {
        window.cancelAnimationFrame(animationFrameRequest);
      }
      if (canvas) {
        canvas.style.filter = "";
      }
    };
  }, [visualizer, shouldAnimate, reduceFlashing]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: isEnabledVisualizer ? "block" : "none",
      }}
    >
      <canvas
        height={height}
        width={width}
        style={{
          height: "100%",
          width: "100%",
          display: "block",
        }}
        ref={canvasRef}
      />
      {isDamping && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 3,
            pointerEvents: "none",
            letterSpacing: 0.5,
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            zIndex: 10,
          }}
        >
          Dimming Flashes
        </div>
      )}
    </div>
  );
}

export default Visualizer;
