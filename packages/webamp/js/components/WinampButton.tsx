import classnames from "classnames";
import {
  useCallback,
  DetailedHTMLProps,
  HTMLAttributes,
  useState,
} from "react";

const ACTIVE_CLASSNAME = "winamp-active";
const LEFT_MOUSE_NUMBER = 0;

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

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
export default function WinampButton(props: Props): JSX.Element {
  const [active, setActive] = useState(false);
  const originalOnMouseDown = props.onMouseDown;

  const onMouseDown = useCallback(
    (e) => {
      if (originalOnMouseDown != null) {
        originalOnMouseDown(e);
      }
      // We only care about left mouse.
      if (e.nativeEvent.button !== LEFT_MOUSE_NUMBER) {
        return;
      }
      setActive(true);

      function onUp(ee: MouseEvent) {
        if (ee.button !== LEFT_MOUSE_NUMBER) {
          return;
        }
        setActive(false);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mouseup", onUp);
    },
    [originalOnMouseDown]
  );

  const originalOnTouchStart = props.onTouchStart;

  const onTouchStart = useCallback(
    (e) => {
      if (originalOnTouchStart != null) {
        originalOnTouchStart(e);
      }
      setActive(true);

      function onUp() {
        setActive(false);
        document.removeEventListener("touchend", onUp);
      }
      document.addEventListener("touchend", onUp);
    },
    [originalOnTouchStart]
  );

  const className = classnames(props.className, { [ACTIVE_CLASSNAME]: active });
  return (
    <div
      {...props}
      className={className}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}
