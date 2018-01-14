// Dynamically set the css background images for all the sprites
import React from "react";
import { createPortal } from "react-dom";
import { connect } from "react-redux";

import { LETTERS } from "../constants";
import { imageSelectors, cursorSelectors } from "../skinSelectors";

const mapRegionNamesToIds = {
  normal: "mainWindowClipPath",
  windowshade: "shadeMainWindowClipPath",
  equalizer: "equalizerWindowClipPath",
  equalizerws: "shadeEqualizerWindowClipPath"
};

const mapRegionNamesToMatcher = {
  normal: "#main-window:not(.shade)",
  windowshade: "#main-window.shade",
  equalizer: "#equalizer-window:not(.shade)",
  equalizerws: "#equalizer-window.shade"
};

const numExIsUsed = skinImages => !!skinImages.DIGIT_0_EX;

class Css extends React.Component {
  componentWillMount() {
    const style = document.createElement("style");
    style.type = "text/css";
    document.head.appendChild(style);
    this.style = style;
  }

  componentWillUnmount() {
    this.style.remove();
    this.style = null;
  }

  render() {
    return createPortal(this.props.children, this.style);
  }
}

class ClipPaths extends React.Component {
  componentWillMount() {
    const paths = document.createElement("div");
    document.body.appendChild(paths);
    this.paths = paths;
  }

  componentWillUnmount() {
    this.paths.remove();
    this.paths = null;
  }

  render() {
    // this.props.children should be an object containing arrays of strings. The
    // keys are ids, and the arrays are arrays of polygon point strings
    const { children } = this.props;

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
      this.paths
    );
  }
}

const Skin = props => {
  const { skinImages, skinCursors, skinGenLetterWidths } = props;
  if (!skinImages || !skinCursors) {
    return null;
  }
  const cssRules = [];
  Object.keys(imageSelectors).forEach(imageName => {
    const imageUrl = skinImages[imageName];
    if (imageUrl) {
      imageSelectors[imageName].forEach(selector => {
        cssRules.push(
          `#winamp2-js ${selector} {background-image: url(${imageUrl})}`
        );
      });
    }
  });

  if (skinGenLetterWidths != null) {
    LETTERS.forEach(letter => {
      const width = skinGenLetterWidths[`GEN_TEXT_${letter}`];
      const selectedWidth =
        skinGenLetterWidths[`GEN_LETTER_SELECTED_${letter}`];
      cssRules.push(
        `#winamp2-js .gen-text-${letter.toLowerCase()} {width: ${width}px;}`
      );
      cssRules.push(
        `#winamp2-js .selected .gen-text-${letter.toLowerCase()} {width: ${selectedWidth}px;}`
      );
    });
  }
  Object.keys(cursorSelectors).forEach(cursorName => {
    const cursorUrl = skinCursors[cursorName];
    if (cursorUrl) {
      cursorSelectors[cursorName].forEach(selector => {
        cssRules.push(
          `#winamp2-js ${selector} {cursor: url(${cursorUrl}), auto}`
        );
      });
    }
  });

  if (numExIsUsed(skinImages)) {
    // This alternate number file requires that the minus sign be
    // formatted differently.
    cssRules.push(
      "#winamp2-js .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }"
    );
  }

  const clipPaths = {};
  for (const [regionName, polygons] of Object.entries(props.skinRegion)) {
    if (polygons) {
      const matcher = mapRegionNamesToMatcher[regionName];
      const id = mapRegionNamesToIds[regionName];
      clipPaths[id] = polygons;
      cssRules.push(`#winamp2-js ${matcher} { clip-path: url(#${id}); }`);
    }
  }
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
  skinGenLetterWidths: state.display.skinGenLetterWidths
}))(Skin);
