// Dynamically set the css background images for all the sprites
import React from "react";
import { createPortal } from "react-dom";
import { connect } from "react-redux";

import { LETTERS } from "../constants";
import { imageSelectors, cursorSelectors } from "../skinSelectors";

const CSS_PREFIX = "#webamp";

const mapRegionNamesToIds = {
  normal: "mainWindowClipPath",
  windowshade: "shadeMainWindowClipPath",
  equalizer: "equalizerWindowClipPath",
  equalizerws: "shadeEqualizerWindowClipPath",
};

const mapRegionNamesToMatcher = {
  normal: "#main-window:not(.shade)",
  windowshade: "#main-window.shade",
  equalizer: "#equalizer-window:not(.shade)",
  equalizerws: "#equalizer-window.shade",
};

const numExIsUsed = skinImages => !!skinImages.DIGIT_0_EX;

function Css({ children }) {
  const style = React.useMemo(() => {
    const s = document.createElement("style");
    s.type = "text/css";
    s.id = "webamp-skin";
    return s;
  }, []);

  React.useLayoutEffect(() => {
    document.head.appendChild(style);
    return () => style.remove();
  }, [style]);

  return createPortal(children, style);
}
// this.props.children should be an object containing arrays of strings. The
// keys are ids, and the arrays are arrays of polygon point strings
function ClipPaths({ children }) {
  const paths = React.useMemo(() => {
    return document.createElement("div");
  }, []);

  React.useLayoutEffect(() => {
    document.body.appendChild(paths);
    return () => paths.remove();
  }, [paths]);

  return createPortal(
    <svg height={0} width={0}>
      <defs>
        {Object.keys(children).map(id => (
          <clipPath id={id} key={id}>
            {children[id].map((points, i) => (
              <polygon points={points} key={i} />
            ))}
          </clipPath>
        ))}
      </defs>
    </svg>,
    paths
  );
}

const FALLBACKS = {
  MAIN_BALANCE_BACKGROUND: "MAIN_VOLUME_BACKGROUND",
  MAIN_BALANCE_THUMB: "MAIN_VOLUME_THUMB",
  MAIN_BALANCE_THUMB_ACTIVE: "MAIN_VOLUME_THUMB_SELECTED",
};

function cssRulesFromProps(props) {
  const { skinImages, skinCursors, skinGenLetterWidths } = props;
  if (!skinImages || !skinCursors) {
    return null;
  }
  const cssRules = [];
  Object.keys(imageSelectors).forEach(imageName => {
    const imageUrl = skinImages[imageName] || skinImages[FALLBACKS[imageName]];
    if (imageUrl) {
      imageSelectors[imageName].forEach(selector => {
        cssRules.push(
          `${CSS_PREFIX} ${selector} {background-image: url(${imageUrl})}`
        );
      });
    }
  });

  if (skinGenLetterWidths != null) {
    LETTERS.forEach(letter => {
      const width = skinGenLetterWidths[`GEN_TEXT_${letter}`];
      const selectedWidth = skinGenLetterWidths[`GEN_TEXT_SELECTED_${letter}`];
      cssRules.push(
        `${CSS_PREFIX} .gen-text-${letter.toLowerCase()} {width: ${width}px;}`
      );
      cssRules.push(
        `${CSS_PREFIX} .selected .gen-text-${letter.toLowerCase()} {width: ${selectedWidth}px;}`
      );
    });
  }
  Object.keys(cursorSelectors).forEach(cursorName => {
    const cursorUrl = skinCursors[cursorName];
    if (cursorUrl) {
      cursorSelectors[cursorName].forEach(selector => {
        cssRules.push(
          `${
            // TODO: Fix this hack
            // Maybe our CSS name spacing should be based on some other class/id
            // than the one we use for defining the main div.
            // That way it could be shared by both the player and the context menu.
            selector.startsWith("#webamp-context-menu") ? "" : CSS_PREFIX
          } ${selector} {cursor: url(${cursorUrl}), auto}`
        );
      });
    }
  });

  if (numExIsUsed(skinImages)) {
    // This alternate number file requires that the minus sign be
    // formatted differently.
    cssRules.push(
      `${CSS_PREFIX} .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }`
    );
  }

  for (const [regionName, polygons] of Object.entries(props.skinRegion)) {
    if (polygons) {
      const matcher = mapRegionNamesToMatcher[regionName];
      const id = mapRegionNamesToIds[regionName];
      cssRules.push(`${CSS_PREFIX} ${matcher} { clip-path: url(#${id}); }`);
    }
  }

  return cssRules;
}

function clipPathsFromProps(props) {
  const clipPaths = {};
  for (const [regionName, polygons] of Object.entries(props.skinRegion)) {
    if (polygons) {
      const id = mapRegionNamesToIds[regionName];
      clipPaths[id] = polygons;
    }
  }
  return clipPaths;
}

const Skin = props => {
  const cssRules = cssRulesFromProps(props);
  if (cssRules == null) {
    return null;
  }
  const clipPaths = clipPathsFromProps(props);
  return (
    <div>
      <Css>{cssRules.join("\n")}</Css>
      <ClipPaths>{clipPaths}</ClipPaths>
    </div>
  );
};

export default connect(state => ({
  skinImages: state.display.skinImages,
  skinCursors: state.display.skinCursors,
  skinRegion: state.display.skinRegion,
  skinGenLetterWidths: state.display.skinGenLetterWidths,
}))(Skin);
