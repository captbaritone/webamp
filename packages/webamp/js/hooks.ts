import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { spritesByName, SpriteName } from "./skinSprites";
import { useDispatch, useSelector } from "react-redux";
import * as Utils from "./utils";
import { Action, Thunk, AppState } from "./types";

interface Size {
  width: number;
  height: number;
}

export function useUnmountedRef(): { current: boolean } {
  const unmountedRef = useRef(false);
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);
  return unmountedRef;
}

export function usePromiseValueOrNull<T>(propValue: Promise<T>): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let disposed = false;
    propValue.then((resolvedValue) => {
      if (disposed) {
        return;
      }
      setValue(resolvedValue);
    });

    return () => {
      disposed = true;
    };
  }, [propValue]);

  return value;
}

export function useScreenSize() {
  const [size] = useState<Size>(Utils.getScreenSize());
  // TODO: We could subscribe to screen size changes.
  return size;
}

export function useWindowSize() {
  const [size, setSize] = useState<Size>(Utils.getWindowSize());
  const handler = useCallback(
    Utils.throttle(() => {
      setSize(Utils.getWindowSize());
    }, 100) as () => void,
    []
  );
  useEffect(() => {
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [handler]);
  return size;
}

const cursorPositionRef = { current: { pageX: 0, pageY: 0 } };
window.document.addEventListener("mousemove", ({ pageX, pageY }) => {
  cursorPositionRef.current = { pageX, pageY };
});

// We use a single global event listener because there is no way to get the
// mouse position aside from an event. Ideally we could create/clean up the
// event listener in the hook, but in the case where we want to check the cursor
// position on mount, that we wouldn't have had time to capture an event.
function useCursorPositionRef() {
  return cursorPositionRef;
}

// CSS hover state is not respected if the cursor is already over the node when
// it is added to the DOM. This hook allows your component to know its hover
// state on mount without waiting for the mouse to move.
// https://stackoverflow.com/a/13259049/1263117
export function useIsHovered() {
  const cursorRef = useCursorPositionRef();
  const [hover, setHover] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (node == null) {
      setHover(false);
      return;
    }
    const domRect = node.getBoundingClientRect();
    const { pageX, pageY } = cursorRef.current;
    setHover(
      pageX >= domRect.left &&
        pageX <= domRect.right &&
        pageY >= domRect.top &&
        pageY <= domRect.bottom
    );

    const enter = () => setHover(true);
    const leave = () => setHover(false);
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);

    return () => {
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
    };
  }, [node, cursorRef]);

  return { ref: setNode, hover };
}

export function useOnClickAway(
  ref: Element | null,
  callback: null | (() => void)
) {
  useEffect(() => {
    if (ref == null || callback == null) {
      return;
    }

    const handleClickOut = (ee: MouseEvent) => {
      const clickOutTarget = ee.target;
      if (!(clickOutTarget instanceof Element)) {
        // TypeScript doesn't realize this will always be true
        return;
      }
      if (ref.contains(clickOutTarget)) {
        return;
      }
      // If the click is _not_ inside the menu.
      callback();
      window.document.removeEventListener("click", handleClickOut, {
        capture: true,
      });
    };

    window.document.addEventListener("click", handleClickOut, {
      capture: true,
    });

    return () => {
      window.document.removeEventListener("click", handleClickOut, {
        capture: true,
      });
    };
  }, [ref, callback]);
}

// TODO: Return useSelector directly and apply the type without wrapping
export function useTypedSelector<T>(selector: (state: AppState) => T): T {
  return useSelector(selector);
}

export function useActionCreator<T extends (...args: any[]) => Action | Thunk>(
  actionCreator: T
): (...funcArgs: Parameters<T>) => void {
  const dispatch = useDispatch();
  return useCallback((...args) => dispatch(actionCreator(...args)), [
    dispatch,
    actionCreator,
  ]);
}

export function useTypedDispatch(): (action: Action | Thunk) => void {
  return useDispatch();
}

type SpriteConfig = {
  base?: SpriteName;
  active?: SpriteName;
  thumb?: SpriteName;
  activeThumb?: SpriteName;
  size?: SpriteName;
};

/**
 * You can set CSS variables on an HTML element via it's style attribute.
 * We use special (hacky) CSS selectors in `webamp.css` which match elements
 * that have these special variables set and then use the value of that
 * variable as the background image.
 *
 * ```css
 * #webamp [style*="--base-background"] {
 *  background-image: var(--base-background);
 * }
 * ```
 *
 * Sprite images are extracted and assigned to CSS variables of their own.
 * By giving an HTML element a style attribute defining one of these CSS
 * variables as one of the sprite images's CSS variables we can set the
 * background of an HTML element to one of the skin's sprites.
 *
 * ## This is super conveluted. So why are we doing it?
 *
 * A simple approach would be to just get the sprite as an object URL and
 * assign it to the HTML element's `backgroundImage` style attribute.
 *
 * The first problem with this approach is that we want the default skin to act
 * as a fallback and the simplest way to achive that is via CSS. We have the
 * parsed skin shadow the CSS variables defined by the default skin. If the
 * parsed skin is missing any sprites, anyone referencing the sprite's CSS
 * variable will get the default skin's sprite.
 *
 * Secondly, I suspect (but have not tested) that it's not performant to use
 * large data URIs as style attributes when the element (and it's attributes)
 * might be leaving the DOM, since the browser might need to re-parse the image
 * every time it's added.
 *
 * Thirdly, we would like to be able to use the `:active` pseudo selector, and
 * `::-webkit-slider-thumb` pseudo elements which cannot be directly set using
 * the style attribute.
 *
 * Using this method (where we assign a CSS variable to a magic CSS variable)
 * solves all three of these:
 *
 * 1. We can encode the default skin as a CSS sheet defining a bunch of CSS
 *    variables, and these will act as fallbacks for any sprites the pased skin is
 *    missing.
 * 2. The sprite data URIs are added to the style sheet and should never have
 *    to be re-parsed.
 * 3. Since the actual styling is done in a real CSS rule, it can take
 *    advantage of pseudo selectors and pseudo elements.
 */
export function useSprite(options: SpriteConfig): React.CSSProperties {
  const style: React.CSSProperties = {};
  (["base", "active", "thumb", "activeThumb"] as const).forEach((name) => {
    const spriteName = options[name];
    if (spriteName != null) {
      // Ideally we could use `{backgroundImage: "var(varName)"}` for `base`.
      // Sadly, that overrides any `:active` styles. So instead we just use
      // this CSS variable hack for all sprite backgrounds.
      // @ts-ignore
      style[`--${name}-background`] = `var(${Utils.imageVarName(spriteName)})`;
    }
  });
  if (options.size != null) {
    const sprite = spritesByName[options.size];
    if (sprite == null) {
      throw new Error(`Could not find sprite style for "${options.size}"`);
    }
    style.height = sprite.height;
    style.width = sprite.width;
  }
  return style;
}
