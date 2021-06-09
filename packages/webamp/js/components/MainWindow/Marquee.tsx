// Single line text display that can animate and hold multiple registers
// Knows how to display various modes like tracking, volume, balance, etc.
import * as React from "react";
import CharacterString from "../CharacterString";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { useTypedSelector, useActionCreator } from "../../hooks";
import * as Utils from "../../utils";

const SEPARATOR = "  ***  ";

const CHAR_WIDTH = 5;
const MARQUEE_MAX_LENGTH = 31;

// Always positive modulus
export const mod = (n: number, m: number): number => ((n % m) + m) % m;

const isLong = (text: string): boolean => text.length >= MARQUEE_MAX_LENGTH;

// Given text and step, how many pixels should it be shifted?
export const stepOffset = (
  text: string,
  step: number,
  pixels: number
): number => {
  if (!isLong(text)) {
    return 0;
  }

  const stepOffsetWidth = step * CHAR_WIDTH; // Steps move one char at a time
  const offset = stepOffsetWidth + pixels;
  const stringLength = (text.length + SEPARATOR.length) * CHAR_WIDTH;

  return mod(offset, stringLength);
};

// Format an int as pixels
export const pixelUnits = (pixels: number): string => `${pixels}px`;

// If text is wider than the marquee, it needs to loop
export const loopText = (text: string): string =>
  isLong(text)
    ? `${text}${SEPARATOR}${text}`
    : text.padEnd(MARQUEE_MAX_LENGTH, " ");

interface UseStepperArgs {
  step: () => void;
  dragging: boolean;
}

// Call `step` every second, except when dragging. Resume stepping 1 second after dragging ceases.
function useStepper({ step, dragging }: UseStepperArgs): void {
  const [stepping, setStepping] = React.useState(true);
  React.useEffect(() => {
    if (stepping === false) {
      return;
    }
    const stepHandle = setInterval(step, 220);
    return () => clearInterval(stepHandle);
  }, [step, stepping]);

  React.useEffect(() => {
    if (dragging) {
      setStepping(false);
      return;
    }
    const steppingTimeout = window.setTimeout(() => {
      setStepping(true);
    }, 1000);
    return () => {
      window.clearTimeout(steppingTimeout);
    };
  }, [dragging]);
}

// When user calls `handleMouseDown`, and moves the mouse, `dragOffset` will update as they drag.
function useDragX() {
  const [mouseDownX, setMouseDownX] = React.useState<number | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);

  React.useEffect(() => {
    if (mouseDownX == null) {
      return;
    }
    const xStart = mouseDownX;
    const handleMouseMove = (ee: MouseEvent | TouchEvent) => {
      const diff = Utils.getX(ee) - xStart;
      setDragOffset(-diff);
    };

    // TODO: Use `once` or something instead of this flag nonsense
    let cleanedUp = false;
    const handleMouseUp = () => {
      if (cleanedUp) {
        return;
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      setMouseDownX(null);
      cleanedUp = true;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return handleMouseUp;
  }, [mouseDownX]);

  const handleMouseDown = React.useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ): void => {
      setMouseDownX(Utils.getX(e));
    },
    []
  );

  return { handleMouseDown, dragOffset, dragging: mouseDownX != null };
}

const Marquee = React.memo(() => {
  const text = useTypedSelector(Selectors.getMarqueeText);
  const doubled = useTypedSelector(Selectors.getDoubled);
  const marqueeStep = useTypedSelector(Selectors.getMarqueeStep);
  const stepMarquee = useActionCreator(Actions.stepMarquee);
  const { handleMouseDown, dragOffset, dragging } = useDragX();
  const offset = stepOffset(text, marqueeStep, dragOffset);
  const offsetPixels = pixelUnits(-offset);

  useStepper({ step: stepMarquee, dragging });

  return (
    <div
      id="marquee"
      className="text"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      title="Song Title"
    >
      <div
        style={{
          whiteSpace: "nowrap",
          willChange: "transform",
          transform: `translateX(${offsetPixels})`,
        }}
        // Force the DOM node to be recreated when the doubled size changes.
        // This works around a Chrome browser bug where the `will-change: transform;`
        // on this node seems to cause a change to the `image-rendering:
        // pixelated;` which we inherit from `#webamp` not to be respected.
        key={doubled ? "doubled" : "not-doubled"}
      >
        <CharacterString>{loopText(text)}</CharacterString>
      </div>
    </div>
  );
});

export default Marquee;
