import { LETTERS } from "./constants";
import { FONT_LOOKUP, imageConstFromChar } from "./skinSprites";

interface Selectors {
  [name: string]: string[];
}

export const imageSelectors: Selectors = {
  MAIN_BALANCE_BACKGROUND: ["#balance"],
  MAIN_BALANCE_THUMB: [
    "#balance::-webkit-slider-thumb",
    "#balance::-moz-range-thumb",
  ],
  MAIN_BALANCE_THUMB_ACTIVE: [
    "#balance:active::-webkit-slider-thumb",
    "#balance:active::-moz-range-thumb",
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
  MAIN_NOT_WORKING_INDICATOR: ["#work-indicator"],
  MAIN_WORKING_INDICATOR: ["#work-indicator.selected"],
  PLAYLIST_TOP_TILE: [
    ".playlist-top-left-fill",
    ".playlist-top-left-spacer",
    ".playlist-top-right-fill",
    ".playlist-top-right-spacer",
  ],
  PLAYLIST_TOP_LEFT_CORNER: [".playlist-top-left"],
  PLAYLIST_TITLE_BAR: [".playlist-top-title"],
  PLAYLIST_TOP_RIGHT_CORNER: [".playlist-top-right"],
  PLAYLIST_TOP_TILE_SELECTED: [
    ".selected .playlist-top-left-fill",
    ".selected .playlist-top-left-spacer",
    ".selected .playlist-top-right-fill",
    ".selected .playlist-top-right-spacer",
  ],
  PLAYLIST_TOP_LEFT_SELECTED: [".selected .playlist-top-left"],
  PLAYLIST_TITLE_BAR_SELECTED: [".selected .playlist-top-title"],
  PLAYLIST_TOP_RIGHT_CORNER_SELECTED: [".selected .playlist-top-right"],
  PLAYLIST_LEFT_TILE: [".playlist-middle-left"],
  PLAYLIST_RIGHT_TILE: [".playlist-middle-right"],
  PLAYLIST_SCROLL_HANDLE: [".playlist-scrollbar-handle"],
  PLAYLIST_SCROLL_HANDLE_SELECTED: [
    ".playlist-middle-right:active .playlist-scrollbar-handle",
  ],
  PLAYLIST_BOTTOM_TILE: [".playlist-bottom"],
  PLAYLIST_BOTTOM_LEFT_CORNER: [".playlist-bottom-left"],
  PLAYLIST_BOTTOM_RIGHT_CORNER: [".playlist-bottom-right"],
  PLAYLIST_VISUALIZER_BACKGROUND: [".playlist-visualizer"],
  PLAYLIST_SHADE_BACKGROUND: ["#playlist-window-shade"],
  PLAYLIST_SHADE_BACKGROUND_LEFT: ["#playlist-window-shade .left"],
  PLAYLIST_SHADE_BACKGROUND_RIGHT: ["#playlist-window-shade .right"],
  PLAYLIST_SHADE_BACKGROUND_RIGHT_SELECTED: [
    "#playlist-window-shade.selected .right",
  ],

  PLAYLIST_ADD_MENU_BAR: ["#playlist-add-menu.selected .bar"],
  PLAYLIST_ADD_URL: ["#playlist-add-menu .add-url"],
  PLAYLIST_ADD_URL_SELECTED: ["#playlist-add-menu .hover .add-url"],
  PLAYLIST_ADD_DIR: ["#playlist-add-menu .add-dir"],
  PLAYLIST_ADD_DIR_SELECTED: ["#playlist-add-menu .hover .add-dir"],
  PLAYLIST_ADD_FILE: ["#playlist-add-menu .add-file"],
  PLAYLIST_ADD_FILE_SELECTED: ["#playlist-add-menu .hover .add-file"],

  PLAYLIST_REMOVE_MENU_BAR: ["#playlist-remove-menu.selected .bar"],
  PLAYLIST_REMOVE_ALL: ["#playlist-remove-menu .remove-all"],
  PLAYLIST_REMOVE_ALL_SELECTED: ["#playlist-remove-menu .hover .remove-all"],
  PLAYLIST_CROP: ["#playlist-remove-menu .crop"],
  PLAYLIST_CROP_SELECTED: ["#playlist-remove-menu .hover .crop"],
  PLAYLIST_REMOVE_SELECTED: ["#playlist-remove-menu .remove-selected"],
  PLAYLIST_REMOVE_SELECTED_SELECTED: [
    "#playlist-remove-menu .hover .remove-selected",
  ],
  PLAYLIST_REMOVE_MISC: ["#playlist-remove-menu .remove-misc"],
  PLAYLIST_REMOVE_MISC_SELECTED: ["#playlist-remove-menu .hover .remove-misc"],

  PLAYLIST_SELECT_MENU_BAR: ["#playlist-selection-menu.selected .bar"],
  PLAYLIST_INVERT_SELECTION: ["#playlist-selection-menu .invert-selection"],
  PLAYLIST_INVERT_SELECTION_SELECTED: [
    "#playlist-selection-menu .hover .invert-selection",
  ],
  PLAYLIST_SELECT_ZERO: ["#playlist-selection-menu .select-zero"],
  PLAYLIST_SELECT_ZERO_SELECTED: [
    "#playlist-selection-menu .hover .select-zero",
  ],
  PLAYLIST_SELECT_ALL: ["#playlist-selection-menu .select-all"],
  PLAYLIST_SELECT_ALL_SELECTED: ["#playlist-selection-menu .hover .select-all"],
  PLAYLIST_CLOSE_SELECTED: ["#playlist-close-button:active"],
  PLAYLIST_COLLAPSE_SELECTED: [
    "#playlist-window #playlist-shade-button:active",
  ],
  PLAYLIST_EXPAND_SELECTED: [
    "#playlist-window-shade #playlist-shade-button:active",
  ],

  PLAYLIST_MISC_MENU_BAR: ["#playlist-misc-menu.selected .bar"],
  PLAYLIST_MISC_OPTIONS: ["#playlist-misc-menu .misc-options"],
  PLAYLIST_MISC_OPTIONS_SELECTED: ["#playlist-misc-menu .hover .misc-options"],
  PLAYLIST_FILE_INFO: ["#playlist-misc-menu .file-info"],
  PLAYLIST_FILE_INFO_SELECTED: ["#playlist-misc-menu .hover .file-info"],
  PLAYLIST_SORT_LIST: ["#playlist-misc-menu .sort-list"],
  PLAYLIST_SORT_LIST_SELECTED: ["#playlist-misc-menu .hover .sort-list"],

  PLAYLIST_LIST_BAR: ["#playlist-list-menu.selected .bar"],
  PLAYLIST_NEW_LIST: ["#playlist-list-menu .new-list"],
  PLAYLIST_NEW_LIST_SELECTED: ["#playlist-list-menu .hover .new-list"],
  PLAYLIST_LOAD_LIST: ["#playlist-list-menu .load-list"],
  PLAYLIST_LOAD_LIST_SELECTED: ["#playlist-list-menu .hover .load-list"],
  PLAYLIST_SAVE_LIST: ["#playlist-list-menu .save-list"],
  PLAYLIST_SAVE_LIST_SELECTED: ["#playlist-list-menu .hover .save-list"],

  EQ_WINDOW_BACKGROUND: ["#equalizer-window:not(.shade)"],
  EQ_TITLE_BAR: [".equalizer-top"],
  EQ_TITLE_BAR_SELECTED: [".selected .equalizer-top"],
  EQ_SLIDER_BACKGROUND: [".band"],
  EQ_SLIDER_THUMB: [".band .slider-handle"],
  // But the "active" pseudo selector on the parent, since clicking
  // anywhere on the track moves the slider.
  EQ_SLIDER_THUMB_SELECTED: [".band:active .slider-handle"],
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
  EQ_SHADE_BACKGROUND: ["#equalizer-window.shade"],
  EQ_SHADE_BACKGROUND_SELECTED: ["#equalizer-window.shade.selected"],
  EQ_SHADE_VOLUME_SLIDER_LEFT: [
    "#equalizer-volume.left::-webkit-slider-thumb",
    "#equalizer-volume.left::-moz-range-thumb",
  ],
  EQ_SHADE_VOLUME_SLIDER_CENTER: [
    "#equalizer-volume.center::-webkit-slider-thumb",
    "#equalizer-volume.center::-moz-range-thumb",
  ],
  EQ_SHADE_VOLUME_SLIDER_RIGHT: [
    "#equalizer-volume.right::-webkit-slider-thumb",
    "#equalizer-volume.right::-moz-range-thumb",
  ],
  EQ_SHADE_BALANCE_SLIDER_LEFT: [
    "#equalizer-balance.left::-webkit-slider-thumb",
    "#equalizer-balance.left::-moz-range-thumb",
  ],
  EQ_SHADE_BALANCE_SLIDER_CENTER: [
    "#equalizer-balance.center::-webkit-slider-thumb",
    "#equalizer-balance.center::-moz-range-thumb",
  ],
  EQ_SHADE_BALANCE_SLIDER_RIGHT: [
    "#equalizer-balance.right::-webkit-slider-thumb",
    "#equalizer-balance.right::-moz-range-thumb",
  ],
  EQ_MAXIMIZE_BUTTON_ACTIVE: ["#equalizer-shade:active"],
  EQ_MINIMIZE_BUTTON_ACTIVE: [
    "#equalizer-window.shade #equalizer-shade:active",
  ],
  EQ_CLOSE_BUTTON: [
    "#equalizer-window.selected #eq-buttons.clicked #equalizer-close",
  ],
  EQ_CLOSE_BUTTON_ACTIVE: [
    "#equalizer-window.selected #eq-buttons.clicked #equalizer-close:active",
  ],
  EQ_SHADE_CLOSE_BUTTON: [
    "#equalizer-window.shade.selected #eq-buttons.clicked #equalizer-close",
  ],
  EQ_SHADE_CLOSE_BUTTON_ACTIVE: [
    "#equalizer-window.shade.selected #eq-buttons.clicked #equalizer-close:active",
  ],
  MAIN_POSITION_SLIDER_BACKGROUND: ["#position"],
  MAIN_POSITION_SLIDER_THUMB: [
    "#position::-webkit-slider-thumb",
    "#position::-moz-range-thumb",
  ],
  MAIN_POSITION_SLIDER_THUMB_SELECTED: [
    "#position:active::-webkit-slider-thumb",
    "#position:active::-moz-range-thumb",
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
  MAIN_EASTER_EGG_TITLE_BAR_SELECTED: [".llama.selected #title-bar"],
  MAIN_OPTIONS_BUTTON: [".selected #title-bar #option.clicked"],
  MAIN_OPTIONS_BUTTON_DEPRESSED: [
    ".selected #title-bar #option:active",
    ".selected #title-bar #option.selected",
  ],
  MAIN_MINIMIZE_BUTTON: [".selected #title-bar #minimize.clicked"],
  MAIN_MINIMIZE_BUTTON_DEPRESSED: [".selected #title-bar #minimize:active"],
  MAIN_SHADE_BUTTON: [".selected #title-bar #shade.clicked"],
  MAIN_SHADE_BUTTON_DEPRESSED: [".selected #title-bar #shade:active"],
  MAIN_CLOSE_BUTTON: [".selected #title-bar #close.clicked"],
  MAIN_CLOSE_BUTTON_DEPRESSED: [".selected #title-bar #close:active"],
  MAIN_CLUTTER_BAR_BACKGROUND: ["#clutter-bar"],
  MAIN_CLUTTER_BAR_BACKGROUND_DISABLED: ["#clutter-bar.disabled"],
  MAIN_CLUTTER_BAR_BUTTON_O_SELECTED: [
    "#button-o:active",
    "#button-0.selected",
  ],
  MAIN_CLUTTER_BAR_BUTTON_A_SELECTED: [
    "#button-a:active",
    "#button-a.selected",
  ],
  MAIN_CLUTTER_BAR_BUTTON_I_SELECTED: [
    "#button-i:active",
    "#button-i.selected",
  ],
  MAIN_CLUTTER_BAR_BUTTON_D_SELECTED: [
    "#button-d:active",
    "#button-d.selected",
  ],
  MAIN_CLUTTER_BAR_BUTTON_V_SELECTED: [
    "#button-v:active",
    "#button-v.selected",
  ],
  MAIN_SHADE_BACKGROUND: [".shade #title-bar"],
  MAIN_SHADE_BACKGROUND_SELECTED: [".shade.selected #title-bar"],
  MAIN_SHADE_BUTTON_SELECTED: [".shade.selected #title-bar #shade"],
  MAIN_SHADE_BUTTON_SELECTED_DEPRESSED: [".shade #title-bar #shade:active"],
  MAIN_SHADE_POSITION_BACKGROUND: [".shade #position"],
  MAIN_SHADE_POSITION_THUMB: [
    ".shade #position::-moz-range-thumb",
    ".shade #position::-webkit-slider-thumb",
  ],
  MAIN_SHADE_POSITION_THUMB_LEFT: [
    ".shade #position.left::-moz-range-thumb",
    ".shade #position.left::-webkit-slider-thumb",
  ],
  MAIN_SHADE_POSITION_THUMB_RIGHT: [
    ".shade #position.right::-moz-range-thumb",
    ".shade #position.right::-webkit-slider-thumb",
  ],
  MAIN_VOLUME_BACKGROUND: ["#volume"],
  MAIN_VOLUME_THUMB: [
    "#volume input::-webkit-slider-thumb",
    "#volume input::-moz-range-thumb",
  ],
  MAIN_VOLUME_THUMB_SELECTED: [
    "#volume input:active::-webkit-slider-thumb",
    "#volume input:active::-moz-range-thumb",
  ],
  GEN_TOP_CENTER_FILL: [".gen-window .gen-top"],
  GEN_TOP_LEFT: [".gen-window .gen-top-left"],
  GEN_TOP_LEFT_END: [".gen-window .gen-top-left-end"],
  GEN_TOP_RIGHT: [".gen-window .gen-top-right"],
  GEN_TOP_RIGHT_END: [".gen-window .gen-top-right-end"],
  GEN_TOP_LEFT_RIGHT_FILL: [
    ".gen-window .gen-top-left-fill",
    ".gen-window .gen-top-right-fill",
  ],

  GEN_TOP_CENTER_FILL_SELECTED: [".gen-window.selected .gen-top"],
  GEN_TOP_LEFT_SELECTED: [".gen-window.selected .gen-top-left"],
  GEN_TOP_LEFT_END_SELECTED: [".gen-window.selected .gen-top-left-end"],
  GEN_TOP_RIGHT_SELECTED: [".gen-window.selected .gen-top-right"],
  GEN_TOP_RIGHT_END_SELECTED: [".gen-window.selected .gen-top-right-end"],
  GEN_TOP_LEFT_RIGHT_FILL_SELECTED: [
    ".gen-window.selected .gen-top-left-fill",
    ".gen-window.selected .gen-top-right-fill",
  ],
  GEN_BOTTOM_LEFT: [".gen-window .gen-bottom-left"],
  GEN_BOTTOM_RIGHT: [".gen-window .gen-bottom-right"],
  GEN_BOTTOM_FILL: [".gen-window .gen-bottom"],
  GEN_MIDDLE_LEFT: [".gen-window .gen-middle-left"],
  GEN_MIDDLE_LEFT_BOTTOM: [".gen-window .gen-middle-left-bottom"],
  GEN_MIDDLE_RIGHT: [".gen-window .gen-middle-right"],
  GEN_MIDDLE_RIGHT_BOTTOM: [".gen-window .gen-middle-right-bottom"],
  GEN_CLOSE_SELECTED: [".gen-window .gen-close:active"],
};

Object.keys(FONT_LOOKUP).forEach((character) => {
  const key = imageConstFromChar(character);
  const code = character.charCodeAt(0);
  imageSelectors[key] = [`.character-${code}`];
});

LETTERS.forEach((character) => {
  imageSelectors[`GEN_TEXT_${character}`] = [
    `.gen-text-${character.toLowerCase()}`,
  ];
  imageSelectors[`GEN_TEXT_SELECTED_${character}`] = [
    `.gen-window.selected .gen-text-${character.toLowerCase()}`,
  ];
});

export const cursorSelectors: Selectors = {
  CLOSE: ["#title-bar #close"],
  // This is not quite right. There are some areas that show this cursor
  // but are not clickable.
  EQSLID: ["#equalizer-window .band"],
  EQNORMAL: ["#equalizer-window"],
  EQCLOSE: ["#equalizer-window #equalizer-close"],
  EQTITLE: [
    "#equalizer-window .title-bar",
    "#equalizer-window.shade",
    "#equalizer-window.shade input",
  ],
  MAINMENU: ["#main-window #option", "#webamp-context-menu .context-menu"],
  MIN: ["#main-window #minimize"],
  NORMAL: [
    // Use this as the default cursor.
    ".window",
    ".window input", // Otherwise
    "#main-window",
    "#main-window.shade #title-bar",
  ],
  MMENU: ["#main-window.shade #option"],
  PNORMAL: ["#playlist-window"],
  // TODO: This is should really only apply to the top part of the top.
  // The chrome around the playlist window is larger than others. The
  // cursor only applies to the same height as the other window's chrome.
  PTBAR: ["#playlist-window .playlist-top"],
  PCLOSE: [
    "#playlist-window #playlist-close-button",
    "#playlist-window-shade #playlist-close-button",
  ],
  PWINBUT: [
    "#playlist-window #playlist-shade-button",
    "#playlist-window-shade #playlist-shade-button",
  ],
  POSBAR: ["#main-window #position"],
  PSIZE: ["#playlist-window #playlist-resize-target"],
  PWSSIZE: ["#playlist-window-shade #playlist-resize-target"],
  PWSNORM: ["#playlist-window-shade"],
  // TODO: The target for this is not quite right.
  PVSCROLL: ["#playlist-window .playlist-scrollbar"],
  SONGNAME: ["#main-window #marquee"],
  TITLEBAR: ["#main-window #title-bar"],
  VOLBAL: ["#volume", "#volume input", "#balance"],
  WINBUT: ["#main-window #shade"],
  WSNORMAL: ["#main-window.shade #title-bar"],
  WSPOSBAR: ["#main-window.shade #position"],
};
