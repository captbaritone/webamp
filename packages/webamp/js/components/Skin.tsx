// Dynamically set the css background images for all the sprites
import { LETTERS } from "../constants";
import { imageSelectors, cursorSelectors } from "../skinSelectors";
import { useTypedSelector } from "../hooks";
import * as Selectors from "../selectors";
import { AniFrame, SkinImages } from "../types";
import { createSelector } from "reselect";
import * as Utils from "../utils";
import Css from "./Css";
import ClipPaths from "./ClipPaths";

const CSS_PREFIX = "#webamp";
const JIFFIES_PER_MS = 1000 / 60;

const mapRegionNamesToIds: { [key: string]: string } = {
  normal: "mainWindowClipPath",
  windowshade: "shadeMainWindowClipPath",
  equalizer: "equalizerWindowClipPath",
  equalizerws: "shadeEqualizerWindowClipPath",
};

const mapRegionNamesToMatcher: { [key: string]: string } = {
  normal: "#main-window:not(.shade)",
  windowshade: "#main-window.shade",
  equalizer: "#equalizer-window:not(.shade)",
  equalizerws: "#equalizer-window.shade",
};

const numExIsUsed = (skinImages: SkinImages) => Boolean(skinImages.DIGIT_0_EX);

const FALLBACKS: { [key: string]: string } = {
  MAIN_BALANCE_BACKGROUND: "MAIN_VOLUME_BACKGROUND",
  MAIN_BALANCE_THUMB: "MAIN_VOLUME_THUMB",
  MAIN_BALANCE_THUMB_ACTIVE: "MAIN_VOLUME_THUMB_SELECTED",
};

// Generate CSS for an animated cursor.
//
// Based on https://css-tricks.com/forums/topic/animated-cursor/
//
// Browsers won't render animated cursor images specified via CSS. For `.ani`
// images, we already have the frames as indiviual images, so we create a CSS
// animation.
//
// This function returns CSS containing a set of keyframes with embedded Data
// URIs as well as a CSS rule to the given selector.
function aniCss(selector: string, frames: AniFrame[]): string {
  const animationName = `webamp-ani-cursor-${Utils.uniqueId()}`;
  const totalDuration = Utils.sum(frames.map(({ rate }) => rate));

  let elapsed = 0;
  const keyframes = frames.map(({ url, rate }) => {
    const percent = (elapsed / totalDuration) * 100;
    // Since our animation loops, we need to tell CSS that 0% === 100%
    const percentStr = percent === 0 ? `0%, 100%` : `${percent}%`;

    elapsed += rate;
    return `${percentStr} { cursor: url(${url}), auto; }`;
  });
  const framesCss = keyframes.join("\n");
  const keyframesCss = `@keyframes ${animationName} { ${framesCss} }`;

  const durationMs = totalDuration * JIFFIES_PER_MS;
  const rule = `${selector} { animation: ${animationName} ${durationMs}ms infinite; }`;
  return [keyframesCss, rule].join("\n");
}

// Cursors might appear in context menus which are not nested inside the window layout div.
function normalizeCursorSelector(selector: string): string {
  return `${
    // TODO: Fix this hack
    // Maybe our CSS name spacing should be based on some other class/id
    // than the one we use for defining the main div.
    // That way it could be shared by both the player and the context menu.
    selector.startsWith("#webamp-context-menu") ? "" : CSS_PREFIX
  } ${selector}`;
}

const getCssRules = createSelector(
  Selectors.getSkinImages,
  Selectors.getSkinCursors,
  Selectors.getSkinLetterWidths,
  Selectors.getSkinRegion,
  (skinImages, skinCursors, skinGenLetterWidths, skinRegion): string | null => {
    if (!skinImages || !skinCursors) {
      return null;
    }
    const cssRules = [];
    Object.keys(imageSelectors).forEach((imageName) => {
      const imageUrl =
        skinImages[imageName] || skinImages[FALLBACKS[imageName]];
      if (imageUrl) {
        imageSelectors[imageName].forEach((selector) => {
          cssRules.push(
            `${CSS_PREFIX} ${selector} {background-image: url(${imageUrl})}`
          );
        });
      }
    });

    if (skinGenLetterWidths != null) {
      LETTERS.forEach((letter) => {
        const width = skinGenLetterWidths[`GEN_TEXT_${letter}`];
        const selectedWidth =
          skinGenLetterWidths[`GEN_TEXT_SELECTED_${letter}`];
        cssRules.push(
          `${CSS_PREFIX} .gen-text-${letter.toLowerCase()} {width: ${width}px;}`
        );
        cssRules.push(
          `${CSS_PREFIX} .selected .gen-text-${letter.toLowerCase()} {width: ${selectedWidth}px;}`
        );
      });
    }

    Object.entries(cursorSelectors).forEach(([cursorName, cursorSelector]) => {
      const cursor = skinCursors[cursorName];
      if (cursor == null) {
        return;
      }
      const cursorRules = cursorSelector
        .map(normalizeCursorSelector)
        .map((selector) => {
          switch (cursor.type) {
            case "cur":
              return `${selector} {cursor: url(${cursor.url}), auto}`;
            case "ani": {
              return aniCss(selector, cursor.frames);
            }
          }
        });
      cssRules.push(...cursorRules);
    });

    if (numExIsUsed(skinImages)) {
      // This alternate number file requires that the minus sign be
      // formatted differently.
      cssRules.push(
        `${CSS_PREFIX} .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }`
      );
    }

    for (const [regionName, polygons] of Object.entries(skinRegion)) {
      if (polygons) {
        const matcher = mapRegionNamesToMatcher[regionName];
        const id = mapRegionNamesToIds[regionName];
        cssRules.push(`${CSS_PREFIX} ${matcher} { clip-path: url(#${id}); }`);
      }
    }

    return cssRules.join("\n");
  }
);

const getClipPaths = createSelector(Selectors.getSkinRegion, (skinRegion) => {
  const clipPaths: { [id: string]: string[] } = {};
  for (const [regionName, polygons] of Object.entries(skinRegion)) {
    if (polygons) {
      const id = mapRegionNamesToIds[regionName];
      clipPaths[id] = polygons;
    }
  }
  return clipPaths;
});

export default function Skin() {
  const cssRules = useTypedSelector(getCssRules);
  const clipPaths = useTypedSelector(getClipPaths);
  if (cssRules == null) {
    return null;
  }
  return (
    <>
      <Css id="webamp-skin">{cssRules}</Css>
      <ClipPaths>{clipPaths}</ClipPaths>
    </>
  );
}
