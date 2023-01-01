import classnames from "classnames";
import {
  useCallback,
  DetailedHTMLProps,
  HTMLAttributes,
  useState,
  PointerEvent as ReactPointerEvent,
} from "react";

const ACTIVE_CLASSNAME = "winamp-active";
const LEFT_MOUSE_NUMBER = 0;

interface DetailedHTMLPropsAndMore
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  requireClicksOriginateLocally?: boolean;
}

type Props = DetailedHTMLPropsAndMore;

/**
 * Renders a `div` with an `.winamp-active` class if the element is being clicked/tapped.
 *
 * For now this mimicks the behavior of `:active`, but in the future we will use
 * this component to mimic Winamp's behavior, which is quite different than
 * `:active`.
 *
 * https://html.spec.whatwg.org/multipage/semantics-other.html#selector-active
 *
 * > An element is said to be being actively pointed at while the user indicates
 * > the element using a pointing device while that pointing device is in the
 * > "down" state (e.g. for a mouse, between the time the mouse button is pressed
 * > and the time it is depressed; for a finger in a multitouch environment, while
 * > the finger is touching the display surface).
 */
export default function WinampButton({
  requireClicksOriginateLocally = true,
  onPointerDown: originalOnPointerDown,
  className,
  ...htmlProps
}: Props): JSX.Element {
  const [active, setActive] = useState(false);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (originalOnPointerDown != null) {
        originalOnPointerDown(e);
      }
      // Release the pointer capture
      // https://w3c.github.io/pointerevents/#implicit-pointer-capture
      // https://w3c.github.io/pointerevents/#pointer-capture
      if (!requireClicksOriginateLocally) {
        // @ts-ignore
        e.target.releasePointerCapture(e.pointerId);
      }
      // We only care about left mouse.
      // -1 button comes on onPointerEnter so we allow that.
      if (
        e.nativeEvent.button !== -1 &&
        e.nativeEvent.button !== LEFT_MOUSE_NUMBER
      ) {
        return;
      }
      setActive(true);

      function onRelease(ee: PointerEvent) {
        setActive(false);
        document.removeEventListener("pointerup", onRelease);
      }
      document.addEventListener("pointerup", onRelease);
    },
    [originalOnPointerDown, requireClicksOriginateLocally]
  );

  // We watch for events onPointerEnter only when requireClicksOriginateLocally === false
  // If the pointer enters the WinampButton area, and the pointer button is already down, trigger a PointerDown
  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      // Emit a CustomEvent pointerup to get the other buttons to release.
      // Add a special -42 detail value so we can identify this event elsewhere and ignore if needed.
      document.dispatchEvent(
        new CustomEvent("pointerup", {
          detail: -42,
        })
      );
      // Simulate a pointerdown on the current button
      onPointerDown(e);
    }
  };

  return (
    <div
      {...htmlProps}
      className={classnames(className, { [ACTIVE_CLASSNAME]: active })}
      onPointerDown={onPointerDown}
      onPointerEnter={
        requireClicksOriginateLocally ? undefined : onPointerEnter
      }
    />
  );
}
