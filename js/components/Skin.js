// Dynamically set the css background images for all the sprites
import React from "react";
import { connect } from "react-redux";

import { FONT_LOOKUP, imageConstFromChar } from "../skinSprites";

const imageSelectors = {
  MAIN_BALANCE_BACKGROUND: ["#balance"],
  MAIN_BALANCE_THUMB: [
    "#balance::-webkit-slider-thumb",
    "#balance::-moz-range-thumb"
  ],
  MAIN_BALANCE_THUMB_ACTIVE: [
    "#balance::-webkit-slider-thumb:active",
    "#balance::-moz-range-thumb:active"
  ],
  MAIN_PREVIOUS_BUTTON: [".actions #previous"],
  MAIN_PREVIOUS_BUTTON_ACTIVE: [".actions #previous:active"],
  MAIN_PLAY_BUTTON: [".actions #play"],
  MAIN_PLAY_BUTTON_ACTIVE: [".actions #play:active"],
  MAIN_PAUSE_BUTTON: [".actions #pause"],
  MAIN_PAUSE_BUTTON_ACTIVE: [".actions #pause:active"],
  MAIN_STOP_BUTTON: [".actions #stop"],
  MAIN_STOP_BUTTON_ACTIVE: [".actions #stop:active"],
  MAIN_NEXT_BUTTON: [".actions #next"],
  MAIN_NEXT_BUTTON_ACTIVE: [".actions #next:active"],
  MAIN_EJECT_BUTTON: ["#eject"],
  MAIN_EJECT_BUTTON_ACTIVE: ["#eject:active"],
  MAIN_WINDOW_BACKGROUND: ["#main-window"],
  MAIN_STEREO: [".media-info #stereo", ".stop .media-info #stereo.selected"],
  MAIN_STEREO_SELECTED: [".media-info #stereo.selected"],
  MAIN_MONO: [".media-info #mono", ".stop .media-info #mono.selected"],
  MAIN_MONO_SELECTED: [".media-info #mono.selected"],
  NO_MINUS_SIGN: ["#time #minus-sign"],
  MINUS_SIGN: ["#time.countdown #minus-sign"],
  DIGIT_0: [".digit-0"],
  DIGIT_1: [".digit-1"],
  DIGIT_2: [".digit-2"],
  DIGIT_3: [".digit-3"],
  DIGIT_4: [".digit-4"],
  DIGIT_5: [".digit-5"],
  DIGIT_6: [".digit-6"],
  DIGIT_7: [".digit-7"],
  DIGIT_8: [".digit-8"],
  DIGIT_9: [".digit-9"],
  NO_MINUS_SIGN_EX: ["#time #minus-sign"],
  MINUS_SIGN_EX: ["#time.countdown #minus-sign"],
  DIGIT_0_EX: [".digit-0"],
  DIGIT_1_EX: [".digit-1"],
  DIGIT_2_EX: [".digit-2"],
  DIGIT_3_EX: [".digit-3"],
  DIGIT_4_EX: [".digit-4"],
  DIGIT_5_EX: [".digit-5"],
  DIGIT_6_EX: [".digit-6"],
  DIGIT_7_EX: [".digit-7"],
  DIGIT_8_EX: [".digit-8"],
  DIGIT_9_EX: [".digit-9"],
  MAIN_PLAYING_INDICATOR: [".play #play-pause"],
  MAIN_PAUSED_INDICATOR: [".pause #play-pause"],
  MAIN_STOPPED_INDICATOR: [".stop #play-pause"],
  MAIN_NOT_WORKING_INDICATOR: [".play #work-indicator"],
  MAIN_WORKING_INDICATOR: [".play #work-indicator.selected"],
  PLAYLIST_TOP_TILE: [".playlist-top"],
  PLAYLIST_TOP_LEFT_CORNER: [".playlist-top-left"],
  PLAYLIST_TITLE_BAR: [".playlist-top-title"],
  PLAYLIST_TOP_RIGHT_CORNER: [".playlist-top-right"],
  PLAYLIST_TOP_TILE_SELECTED: [".selected .playlist-top"],
  PLAYLIST_TOP_LEFT_SELECTED: [".selected .playlist-top-left"],
  PLAYLIST_TITLE_BAR_SELECTED: [".selected .playlist-top-title"],
  PLAYLIST_TOP_RIGHT_CORNER_SELECTED: [".selected .playlist-top-right"],
  PLAYLIST_LEFT_TILE: [".playlist-left"],
  PLAYLIST_RIGHT_TILE: [".playlist-right"],
  PLAYLIST_BOTTOM_TILE: [".playlist-bottom"],
  PLAYLIST_BOTTOM_LEFT_CORNER: [".playlist-bottom-left"],
  PLAYLIST_BOTTOM_RIGHT_CORNER: [".playlist-bottom-right"],
  PLAYLIST_VISUALIZER_BACKGROUND: [".playlist-visualizer"],
  PLAYLIST_SHADE_BACKGROUND: ["#playlist.shade"],
  EQ_WINDOW_BACKGROUND: ["#equalizer-window"],
  EQ_TITLE_BAR: [".equalizer-top"],
  EQ_TITLE_BAR_SELECTED: [".selected .equalizer-top"],
  EQ_SLIDER_BACKGROUND: [".band"],
  EQ_SLIDER_THUMB: [".band .rc-slider-handle"],
  EQ_SLIDER_THUMB_SELECTED: [".band .rc-slider-handle:active"],
  EQ_ON_BUTTON: ["#on"],
  EQ_ON_BUTTON_DEPRESSED: ["#on:active"],
  EQ_ON_BUTTON_SELECTED: ["#on.selected"],
  EQ_ON_BUTTON_SELECTED_DEPRESSED: ["#on.selected:active"],
  EQ_AUTO_BUTTON: ["#auto"],
  EQ_AUTO_BUTTON_DEPRESSED: ["#auto:active"],
  EQ_AUTO_BUTTON_SELECTED: ["#auto.selected"],
  EQ_AUTO_BUTTON_SELECTED_DEPRESSED: ["#auto.selected:active"],
  EQ_GRAPH_BACKGROUND: ["#eqGraph"],
  EQ_PRESETS_BUTTON: ["#presets"],
  EQ_PRESETS_BUTTON_SELECTED: ["#presets:active"],
  EQ_PREAMP_LINE: ["#preamp-line"],
  MAIN_POSITION_SLIDER_BACKGROUND: ["#position"],
  MAIN_POSITION_SLIDER_THUMB: [
    "#position::-webkit-slider-thumb",
    "#position::-moz-range-thumb"
  ],
  MAIN_POSITION_SLIDER_THUMB_SELECTED: [
    "#position:active::-webkit-slider-thumb",
    "#position:active::-moz-range-thumb"
  ],
  MAIN_SHUFFLE_BUTTON: ["#shuffle"],
  MAIN_SHUFFLE_BUTTON_DEPRESSED: ["#shuffle:active"],
  MAIN_SHUFFLE_BUTTON_SELECTED: ["#shuffle.selected"],
  MAIN_SHUFFLE_BUTTON_SELECTED_DEPRESSED: ["#shuffle.selected:active"],
  MAIN_REPEAT_BUTTON: ["#repeat"],
  MAIN_REPEAT_BUTTON_DEPRESSED: ["#repeat:active"],
  MAIN_REPEAT_BUTTON_SELECTED: ["#repeat.selected"],
  MAIN_REPEAT_BUTTON_SELECTED_DEPRESSED: ["#repeat.selected:active"],
  MAIN_EQ_BUTTON: ["#equalizer-button"],
  MAIN_EQ_BUTTON_SELECTED: ["#equalizer-button.selected"],
  MAIN_EQ_BUTTON_DEPRESSED: ["#equalizer-button:active"],
  MAIN_EQ_BUTTON_DEPRESSED_SELECTED: ["#equalizer-button.selected:active"],
  MAIN_PLAYLIST_BUTTON: ["#playlist-button"],
  MAIN_PLAYLIST_BUTTON_SELECTED: ["#playlist-button.selected"],
  MAIN_PLAYLIST_BUTTON_DEPRESSED: ["#playlist-button:active"],
  MAIN_PLAYLIST_BUTTON_DEPRESSED_SELECTED: ["#playlist-button.selected:active"],
  MAIN_TITLE_BAR: ["#title-bar"],
  MAIN_TITLE_BAR_SELECTED: [".selected #title-bar"],
  MAIN_EASTER_EGG_TITLE_BAR: [".llama #title-bar"],
  MAIN_EASTER_EGG_TITLE_BAR_SELECTED: [".llama #title-bar.selected"],
  MAIN_OPTIONS_BUTTON: ["#title-bar #option"],
  MAIN_OPTIONS_BUTTON_DEPRESSED: [
    "#title-bar #option:active",
    "#title-bar #option:selected"
  ],
  MAIN_MINIMIZE_BUTTON: ["#title-bar #minimize"],
  MAIN_MINIMIZE_BUTTON_DEPRESSED: ["#title-bar #minimize:active"],
  MAIN_SHADE_BUTTON: ["#title-bar #shade"],
  MAIN_SHADE_BUTTON_DEPRESSED: ["#title-bar #shade:active"],
  MAIN_CLOSE_BUTTON: ["#title-bar #close"],
  MAIN_CLOSE_BUTTON_DEPRESSED: ["#title-bar #close:active"],
  MAIN_CLUTTER_BAR_BACKGROUND: ["#clutter-bar"],
  MAIN_CLUTTER_BAR_BACKGROUND_DISABLED: ["#clutter-bar.disabled"],
  MAIN_CLUTTER_BAR_BUTTON_O_SELECTED: [
    "#button-o:active",
    "#button-0:selected"
  ],
  MAIN_CLUTTER_BAR_BUTTON_A_SELECTED: [
    "#button-a:active",
    "#button-a.selected"
  ],
  MAIN_CLUTTER_BAR_BUTTON_I_SELECTED: [
    "#button-i:active",
    "#button-i.selected"
  ],
  MAIN_CLUTTER_BAR_BUTTON_D_SELECTED: [
    "#button-d:active",
    "#button-d.selected"
  ],
  MAIN_CLUTTER_BAR_BUTTON_V_SELECTED: [
    "#button-v:active",
    "#button-v.selected"
  ],
  MAIN_SHADE_BACKGROUND: [".shade #title-bar"],
  MAIN_SHADE_BACKGROUND_SELECTED: [".shade #title-bar.selected"],
  MAIN_SHADE_BUTTON_SELECTED: [".shade #title-bar #shade"],
  MAIN_SHADE_BUTTON_SELECTED_DEPRESSED: [".shade #title-bar #shade:active"],
  MAIN_SHADE_POSITION_BACKGROUND: [".shade #position"],
  MAIN_SHADE_POSITION_THUMB: [
    ".shade #position::-moz-range-thumb",
    ".shade #position::-webkit-slider-thumb"
  ],
  MAIN_SHADE_POSITION_THUMB_LEFT: [
    ".shade #position.left::-moz-range-thumb",
    ".shade #position.left::-webkit-slider-thumb"
  ],
  MAIN_SHADE_POSITION_THUMB_RIGHT: [
    ".shade #position.right::-moz-range-thumb",
    ".shade #position.right::-webkit-slider-thumb"
  ],
  MAIN_VOLUME_BACKGROUND: ["#volume"],
  MAIN_VOLUME_THUMB: [
    "#volume::-webkit-slider-thumb",
    "#volume::-moz-range-thumb"
  ],
  MAIN_VOLUME_THUMB_SELECTED: [
    "#volume::-webkit-slider-thumb:active",
    "#volume::-moz-range-thumb:active"
  ]
};

Object.keys(FONT_LOOKUP).forEach(character => {
  const key = imageConstFromChar(character);
  const code = character.charCodeAt(0);
  imageSelectors[key] = [`.character-${code}`];
});

const numExIsUsed = skinImages => !!skinImages.DIGIT_0_EX;

const Skin = props => {
  if (!props.skinImages) {
    return null;
  }
  const cssRules = [];
  Object.keys(imageSelectors).map(imageName => {
    const imageUrl = props.skinImages[imageName];
    if (imageUrl) {
      imageSelectors[imageName].forEach(selector => {
        cssRules.push(
          `#winamp2-js ${selector} {background-image: url(${imageUrl})}`
        );
      });
    }
  });
  if (numExIsUsed(props.skinImages)) {
    // This alternate number file requires that the minus sign be
    // formatted differently.
    cssRules.push(
      "#winamp2-js .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }"
    );
  }
  return <style type="text/css">{cssRules.join("\n")}</style>;
};

export default connect(state => ({ skinImages: state.display.skinImages }))(
  Skin
);
