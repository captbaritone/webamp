// Decides, for each touch on the feed's Webamp, whether the visitor meant to
// use Webamp or to scroll the feed, and only lets Webamp see the touch in the
// first case.
//
//   - Tap: goes to Webamp (buttons, selecting a track, ...).
//   - Horizontal drag: goes to Webamp (volume/balance/seek, moving a window).
//   - Vertical swipe: scrolls the feed. Webamp never sees it, so a swipe that
//     starts on an equalizer band doesn't change it.
//   - Press and hold, then drag: "grabs" whatever is under the finger
//     (equalizer bands, the playlist, a window) and the drag goes to Webamp.
//
// Webamp reacts to a touch as soon as it starts, before we can know which of
// these it is. So we hold back the start of every touch (Webamp's pointerdown
// and touchstart handlers never see it), and once the intent is clear either
// let the browser scroll or replay the start to Webamp: a pointerdown (sliders,
// buttons) and, for drags, a mousedown (windows and the playlist follow a
// mousedown with the real touchmoves). Mouse and pen input is untouched.
//
// Webamp's React root listens on the host element, and these capture listeners
// are registered on it before Webamp renders, so they run first.

const HOLD_MS = 300;
// Movement within this distance still counts as a tap or a hold.
const SLOP_PX = 8;
// A contextmenu this soon after a touch started is that touch's long press.
const LONG_PRESS_MENU_WINDOW_MS = 1000;

type PendingTouch = {
  target: Element;
  pointerId: number;
  x: number;
  y: number;
  holdTimer: ReturnType<typeof setTimeout>;
};

export type WebampTouchIntent = "tap" | "drag" | "hold";

export function attachWebampTouchHandling(
  host: HTMLElement,
  // Called when a touch turns out to be meant for Webamp.
  onWebampTouch: (intent: WebampTouchIntent, target: Element) => void
): void {
  let pending: PendingTouch | null = null;
  // Webamp has been handed the current touch; block the feed from scrolling.
  let grabbed = false;
  // Set while we dispatch our own replayed events, so we let them through.
  let replaying = false;
  // When the last touch on Webamp started (see the contextmenu handler).
  let lastTouchStart = -Infinity;

  const options = { capture: true } as const;

  function replayPress(touch: PendingTouch, withMouse: boolean) {
    const init: PointerEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: touch.x,
      clientY: touch.y,
      button: 0,
      buttons: 1,
      // The real finger's pointer, so pointer capture works.
      pointerId: touch.pointerId,
      pointerType: "touch",
      isPrimary: true,
    };
    replaying = true;
    try {
      touch.target.dispatchEvent(new PointerEvent("pointerdown", init));
      if (withMouse) {
        touch.target.dispatchEvent(new MouseEvent("mousedown", init));
      }
    } finally {
      replaying = false;
    }
  }

  function grab(intent: "drag" | "hold") {
    const touch = pending;
    if (touch == null) return;
    clearTimeout(touch.holdTimer);
    pending = null;
    grabbed = true;
    if (intent === "hold") navigator.vibrate?.(10);
    replayPress(touch, true);
    onWebampTouch(intent, touch.target);
  }

  function reset() {
    if (pending != null) clearTimeout(pending.holdTimer);
    pending = null;
    grabbed = false;
  }

  host.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType !== "touch" || replaying) return;
      e.stopImmediatePropagation();
      reset();
      lastTouchStart = performance.now();
      const touch: PendingTouch = {
        target: e.target as Element,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        holdTimer: setTimeout(() => grab("hold"), HOLD_MS),
      };
      pending = touch;
    },
    options
  );

  host.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "touch" || pending == null) return;
      const dx = e.clientX - pending.x;
      const dy = e.clientY - pending.y;
      if (Math.hypot(dx, dy) < SLOP_PX) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        grab("drag");
      } else {
        // A swipe: the browser scrolls the feed (and sends pointercancel).
        reset();
      }
    },
    options
  );

  host.addEventListener(
    "pointerup",
    (e) => {
      if (e.pointerType !== "touch" || replaying) return;
      const touch = pending;
      if (touch != null) {
        // A tap. Give Webamp the press before this release; the browser's
        // own click (and compatibility mouse events) follow.
        clearTimeout(touch.holdTimer);
        pending = null;
        replayPress(touch, false);
        onWebampTouch("tap", touch.target);
      }
      grabbed = false;
    },
    options
  );

  host.addEventListener("pointercancel", reset, options);

  // Webamp's own touch handlers (windows, the playlist) would start a drag
  // themselves; they get a replayed mousedown instead when it's meant for them.
  host.addEventListener(
    "touchstart",
    (e) => {
      e.stopImmediatePropagation();
    },
    { capture: true, passive: true }
  );

  // Once Webamp has the touch, the drag is for it, not the feed.
  host.addEventListener(
    "touchmove",
    (e) => {
      if (grabbed && e.cancelable) e.preventDefault();
    },
    { capture: true, passive: false }
  );

  // A long press fires contextmenu, which would open the browser's menu and
  // Webamp's own (it handles contextmenu as a right-click). Some browsers
  // cancel the touch first, so go by when it started rather than our state.
  // A mouse right-click still opens Webamp's menu.
  host.addEventListener(
    "contextmenu",
    (e) => {
      if (performance.now() - lastTouchStart < LONG_PRESS_MENU_WINDOW_MS) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    options
  );
}
