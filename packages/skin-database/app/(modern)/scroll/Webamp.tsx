import { useEffect, useRef } from "react";
import type { WebampTarget } from "./eventTypes";
import {
  SCREENSHOT_HEIGHT,
  SCREENSHOT_WIDTH,
} from "../../../legacy-client/src/constants";

// @ts-ignore
type WebampInstance = import("webamp").default;

/**
 * Keeps a single Webamp instance alive for the lifetime of the scroller and
 * moves it into `slot` whenever the focused skin changes. Swapping the skin on
 * a live instance (rather than creating one per skin) means the music keeps
 * playing as you scroll.
 */
export function useSharedWebamp(
  slot: HTMLElement | null,
  skinUrl: string,
  // Called when playback starts, pauses, stops, etc. (Webamp's media status).
  onMediaStatusChange?: (status: string) => void,
  // Called for each completed press on Webamp (not ones that become a scroll).
  onInteract?: (target: WebampTarget) => void
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const webampPromiseRef = useRef<Promise<WebampInstance> | null>(null);
  const currentSkinUrlRef = useRef<string | null>(null);
  const onMediaStatusChangeRef = useRef(onMediaStatusChange);
  onMediaStatusChangeRef.current = onMediaStatusChange;
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      webampPromiseRef.current?.then((webamp) => webamp.dispose());
      webampPromiseRef.current = null;
      hostRef.current?.remove();
      hostRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (slot == null) {
      return;
    }
    let cancelled = false;
    // Holds the screenshot and the slot. Marked once Webamp is showing so the
    // screenshot can be hidden (see scroll.css) and windows can be moved
    // around without it showing through.
    const container = slot.parentElement;

    if (hostRef.current == null) {
      const host = document.createElement("div");
      // Styled in scroll.css (lets touch swipes over Webamp scroll the feed).
      host.className = "feed-webamp";
      Object.assign(host.style, {
        width: `${SCREENSHOT_WIDTH}px`,
        height: `${SCREENSHOT_HEIGHT}px`,
        position: "relative",
      });
      // Webamp uses the wheel for volume (main window) and scrolling the
      // playlist, and calls preventDefault, which stops the feed from moving
      // to the next skin. Stop wheel events here, on the way down, so they
      // never reach Webamp. We don't preventDefault, so the feed still
      // scrolls.
      host.addEventListener("wheel", (e) => e.stopPropagation(), {
        capture: true,
        passive: true,
      });
      // Report presses on Webamp once they complete. If the browser turns a
      // touch into a scroll it fires pointercancel instead, and we drop it.
      let pressTarget: WebampTarget | null = null;
      host.addEventListener(
        "pointerdown",
        (e) => {
          pressTarget = classifyWebampTarget(e.target as Element);
        },
        { capture: true, passive: true }
      );
      host.addEventListener(
        "pointerup",
        () => {
          if (pressTarget != null) onInteractRef.current?.(pressTarget);
          pressTarget = null;
        },
        { capture: true, passive: true }
      );
      host.addEventListener(
        "pointercancel",
        () => {
          pressTarget = null;
        },
        { capture: true, passive: true }
      );
      hostRef.current = host;
    }
    const host = hostRef.current;
    // Hide instantly so the previous skin doesn't ghost over the new
    // screenshot, then fade in once the new skin is ready.
    host.style.transition = "none";
    host.style.opacity = "0";
    // Moving the DOM node preserves Webamp's React root and all of its state.
    slot.appendChild(host);

    async function show() {
      if (webampPromiseRef.current == null) {
        currentSkinUrlRef.current = skinUrl;
        webampPromiseRef.current = createWebamp(host, skinUrl).then(
          (webamp) => {
            let lastStatus = webamp.getMediaStatus();
            unsubscribeRef.current = webamp.store.subscribe(() => {
              const status = webamp.getMediaStatus();
              if (status !== lastStatus) {
                lastStatus = status;
                onMediaStatusChangeRef.current?.(String(status));
              }
            });
            return webamp;
          }
        );
      }
      const webamp = await webampPromiseRef.current;
      if (cancelled) return;

      if (currentSkinUrlRef.current !== skinUrl) {
        currentSkinUrlRef.current = skinUrl;
        resetWindowLayout(webamp);
        webamp.setSkinFromUrl(skinUrl);
        await webamp.skinIsLoaded();
        if (cancelled) return;
      }

      const zoom = slot!.getBoundingClientRect().width / SCREENSHOT_WIDTH;
      host
        .querySelector<HTMLElement>("#webamp")
        ?.style.setProperty("zoom", String(zoom));
      host.style.transition = "opacity 0.3s linear";
      host.style.opacity = "1";
      // Hide the screenshot once Webamp has faded in over it.
      await new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
      if (cancelled) return;
      container?.setAttribute(WEBAMP_READY_ATTRIBUTE, "");
    }

    show().catch((error) => {
      console.error("Failed to load Webamp", error);
    });

    return () => {
      cancelled = true;
      container?.removeAttribute(WEBAMP_READY_ATTRIBUTE);
    };
  }, [slot, skinUrl]);
}

function classifyWebampTarget(target: Element): WebampTarget {
  if (target.closest("input")) return "slider";
  // Webamp marks the areas you can drag a window by.
  if (target.classList.contains("draggable")) return "drag";
  return "control";
}

async function createWebamp(
  host: HTMLElement,
  skinUrl: string
): Promise<WebampInstance> {
  // @ts-ignore
  const { default: Webamp } = await import("webamp");
  const webamp = new Webamp({
    initialSkin: { url: skinUrl },
    initialTracks,
    enableHotkeys: true,
    // Only needs to sit above its own screenshot. Anything higher puts it on
    // top of the bottom menu bar and its popup.
    zIndex: 1,
  });
  webamp.onClose(() => {
    // Show the screenshot again rather than an empty space.
    host
      .closest(`[${WEBAMP_READY_ATTRIBUTE}]`)
      ?.removeAttribute(WEBAMP_READY_ATTRIBUTE);
  });
  await webamp.renderInto(host);
  return webamp;
}

const WEBAMP_READY_ATTRIBUTE = "data-webamp-ready";

// Which windows are open in Webamp's default layout (and in screenshots).
const DEFAULT_WINDOWS_OPEN = [
  ["main", true],
  ["equalizer", true],
  ["playlist", true],
  ["milkdrop", false],
] as const;

// Put the windows back where they are in the screenshot, so each new skin
// lines up with its screenshot even if the user moved or closed windows while
// viewing the previous one.
//
// Webamp has no public API for this, so we dispatch its internal actions
// directly. The positions are Webamp's default stacked layout: each window is
// 116px tall, which is why screenshots are 275x348.
function resetWindowLayout(webamp: WebampInstance) {
  // Only reopen if the user closed Webamp. Reopening also resets its playback
  // status to stopped, even if audio is still playing, which freezes the
  // visualizer and stops it advancing to the next track.
  if (webamp.store.getState().display.closed) {
    webamp.reopen();
  }
  // Put each window back in its default open/shade state. There are only
  // toggles for these, so we compare against the current state.
  const { genWindows } = webamp.store.getState().windows;
  for (const [windowId, defaultOpen] of DEFAULT_WINDOWS_OPEN) {
    const windowState = genWindows[windowId];
    if (windowState == null) continue;
    if (windowState.open !== defaultOpen) {
      webamp.store.dispatch(
        defaultOpen
          ? { type: "TOGGLE_WINDOW", windowId }
          : { type: "CLOSE_WINDOW", windowId }
      );
    }
    // None are shaded by default.
    if (windowState.shade) {
      webamp.store.dispatch({ type: "TOGGLE_WINDOW_SHADE_MODE", windowId });
    }
  }
  webamp.store.dispatch({ type: "RESET_WINDOW_SIZES" });
  webamp.store.dispatch({
    type: "UPDATE_WINDOW_POSITIONS",
    positions: {
      main: { x: 0, y: 0 },
      equalizer: { x: 0, y: 116 },
      playlist: { x: 0, y: 232 },
    },
    absolute: true,
  });
}

const album = "netBloc Vol. 24: tiuqottigeloot";

const initialTracks = [
  {
    metaData: {
      artist: "DJ Mike Llama",
      title: "Llama Whippin' Intro",
    },
    url: "/llama.mp3",
    duration: 5.322286,
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Diablo_Swing_Orchestra_-_01_-_Heroines.mp3",
    duration: 322.612245,
    metaData: {
      title: "Heroines",
      artist: "Diablo Swing Orchestra",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Eclectek_-_02_-_We_Are_Going_To_Eclecfunk_Your_Ass.mp3",
    duration: 190.093061,
    metaData: {
      title: "We Are Going To Eclecfunk Your Ass",
      artist: "Eclectek",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3",
    duration: 214.622041,
    metaData: {
      title: "Seventeen",
      artist: "Auto-Pilot",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Muha_-_04_-_Microphone.mp3",
    duration: 181.838367,
    metaData: {
      title: "Microphone",
      artist: "Muha",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Just_Plain_Ant_-_05_-_Stumble.mp3",
    duration: 86.047347,
    metaData: {
      title: "Stumble",
      artist: "Just Plain Ant",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Sleaze_-_06_-_God_Damn.mp3",
    duration: 226.795102,
    metaData: {
      title: "God Damn",
      artist: "Sleaze",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Juanitos_-_07_-_Hola_Hola_Bossa_Nova.mp3",
    duration: 207.072653,
    metaData: {
      title: "Hola Hola Bossa Nova",
      artist: "Juanitos",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Entertainment_for_the_Braindead_-_08_-_Resolutions_Chris_Summer_Remix.mp3",
    duration: 314.331429,
    metaData: {
      title: "Resolutions (Chris Summer Remix)",
      artist: "Entertainment for the Braindead",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Nobara_Hayakawa_-_09_-_Trail.mp3",
    duration: 204.042449,
    metaData: {
      title: "Trail",
      artist: "Nobara Hayakawa",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Paper_Navy_-_10_-_Tongue_Tied.mp3",
    duration: 201.116735,
    metaData: {
      title: "Tongue Tied",
      artist: "Paper Navy",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/60_Tigres_-_11_-_Garage.mp3",
    duration: 245.394286,
    metaData: {
      title: "Garage",
      artist: "60 Tigres",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/CM_aka_Creative_-_12_-_The_Cycle_Featuring_Mista_Mista.mp3",
    duration: 221.44,
    metaData: {
      title: "The Cycle (Featuring Mista Mista)",
      artist: "CM aka Creative",
      album,
    },
  },
];
