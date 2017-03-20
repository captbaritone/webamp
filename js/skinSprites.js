/* TODO: There are too many " " and "_" characters */
export const FONT_LOOKUP = {
  a: [0, 0],
  b: [0, 1],
  c: [0, 2],
  d: [0, 3],
  e: [0, 4],
  f: [0, 5],
  g: [0, 6],
  h: [0, 7],
  i: [0, 8],
  j: [0, 9],
  k: [0, 10],
  l: [0, 11],
  m: [0, 12],
  n: [0, 13],
  o: [0, 14],
  p: [0, 15],
  q: [0, 16],
  r: [0, 17],
  s: [0, 18],
  t: [0, 19],
  u: [0, 20],
  v: [0, 21],
  w: [0, 22],
  x: [0, 23],
  y: [0, 24],
  z: [0, 25],
  '"': [0, 26],
  "@": [0, 27],
  "0": [1, 0],
  "1": [1, 1],
  "2": [1, 2],
  "3": [1, 3],
  "4": [1, 4],
  "5": [1, 5],
  "6": [1, 6],
  "7": [1, 7],
  "8": [1, 8],
  "9": [1, 9],
  _: [1, 11],
  ":": [1, 12],
  "(": [1, 13],
  ")": [1, 14],
  "-": [1, 15],
  "'": [1, 16],
  "!": [1, 17],
  "+": [1, 19],
  "\\": [1, 20],
  "/": [1, 21],
  "[": [1, 22],
  "]": [1, 23],
  "^": [1, 24],
  "&": [1, 25],
  "%": [1, 26],
  ".": [1, 27],
  "=": [1, 28],
  $: [1, 29],
  "#": [1, 30],
  Å: [2, 0],
  Ö: [2, 1],
  Ä: [2, 2],
  "?": [2, 3],
  "*": [2, 4],
  " ": [2, 5],
  "<": [1, 22],
  ">": [1, 23],
  "{": [1, 22],
  "}": [1, 23]
};

export const imageConstFromChar = char => `CHARACTER_${char.charCodeAt(0)}`;

const CHAR_X = 5;
const CHAR_Y = 6;

const characterSprites = [];
for (const key in FONT_LOOKUP) {
  if (FONT_LOOKUP.hasOwnProperty(key)) {
    const position = FONT_LOOKUP[key];
    characterSprites.push({
      name: imageConstFromChar(key),
      y: position[0] * CHAR_Y,
      x: position[1] * CHAR_X,
      width: CHAR_X,
      height: CHAR_Y
    });
  }
}

export default [
  {
    name: "BALANCE",
    sprites: [
      { name: "MAIN_BALANCE_BACKGROUND", x: 9, y: 0, width: 38, height: 420 },
      { name: "MAIN_BALANCE_THUMB", x: 15, y: 422, width: 14, height: 11 },
      { name: "MAIN_BALANCE_THUMB_ACTIVE", x: 0, y: 422, width: 14, height: 11 }
    ]
  },
  {
    name: "CBUTTONS",
    sprites: [
      { name: "MAIN_PREVIOUS_BUTTON", x: 0, y: 0, width: 23, height: 18 },
      {
        name: "MAIN_PREVIOUS_BUTTON_ACTIVE",
        x: 0,
        y: 18,
        width: 23,
        height: 18
      },
      { name: "MAIN_PLAY_BUTTON", x: 23, y: 0, width: 23, height: 18 },
      { name: "MAIN_PLAY_BUTTON_ACTIVE", x: 23, y: 18, width: 23, height: 18 },
      { name: "MAIN_PAUSE_BUTTON", x: 46, y: 0, width: 23, height: 18 },
      { name: "MAIN_PAUSE_BUTTON_ACTIVE", x: 46, y: 18, width: 23, height: 18 },
      { name: "MAIN_STOP_BUTTON", x: 69, y: 0, width: 23, height: 18 },
      { name: "MAIN_STOP_BUTTON_ACTIVE", x: 69, y: 18, width: 23, height: 18 },
      { name: "MAIN_NEXT_BUTTON", x: 92, y: 0, width: 23, height: 18 },
      { name: "MAIN_NEXT_BUTTON_ACTIVE", x: 92, y: 18, width: 22, height: 18 },
      { name: "MAIN_EJECT_BUTTON", x: 114, y: 0, width: 22, height: 16 },
      { name: "MAIN_EJECT_BUTTON_ACTIVE", x: 114, y: 16, width: 22, height: 16 }
    ]
  },
  {
    name: "MAIN",
    sprites: [
      { name: "MAIN_WINDOW_BACKGROUND", x: 0, y: 0, width: 275, height: 116 }
    ]
  },
  {
    name: "MONOSTER",
    sprites: [
      { name: "MAIN_STEREO", x: 0, y: 12, width: 29, height: 12 },
      { name: "MAIN_STEREO_SELECTED", x: 0, y: 0, width: 29, height: 12 },
      { name: "MAIN_MONO", x: 29, y: 12, width: 29, height: 12 },
      { name: "MAIN_MONO_SELECTED", x: 29, y: 0, width: 29, height: 12 }
    ]
  },
  {
    name: "NUMBERS",
    sprites: [
      { name: "NO_MINUS_SIGN", x: 9, y: 6, width: 5, height: 1 },
      { name: "MINUS_SIGN", x: 20, y: 6, width: 5, height: 1 },
      { name: "DIGIT_0", x: 0, y: 0, width: 9, height: 13 },
      { name: "DIGIT_1", x: 9, y: 0, width: 9, height: 13 },
      { name: "DIGIT_2", x: 18, y: 0, width: 9, height: 13 },
      { name: "DIGIT_3", x: 27, y: 0, width: 9, height: 13 },
      { name: "DIGIT_4", x: 36, y: 0, width: 9, height: 13 },
      { name: "DIGIT_5", x: 45, y: 0, width: 9, height: 13 },
      { name: "DIGIT_6", x: 54, y: 0, width: 9, height: 13 },
      { name: "DIGIT_7", x: 63, y: 0, width: 9, height: 13 },
      { name: "DIGIT_8", x: 72, y: 0, width: 9, height: 13 },
      { name: "DIGIT_9", x: 81, y: 0, width: 9, height: 13 }
    ]
  },
  {
    name: "NUMS_EX",
    sprites: [
      { name: "NO_MINUS_SIGN_EX", x: 90, y: 0, width: 9, height: 13 },
      { name: "MINUS_SIGN_EX", x: 99, y: 0, width: 9, height: 13 },
      { name: "DIGIT_0_EX", x: 0, y: 0, width: 9, height: 13 },
      { name: "DIGIT_1_EX", x: 9, y: 0, width: 9, height: 13 },
      { name: "DIGIT_2_EX", x: 18, y: 0, width: 9, height: 13 },
      { name: "DIGIT_3_EX", x: 27, y: 0, width: 9, height: 13 },
      { name: "DIGIT_4_EX", x: 36, y: 0, width: 9, height: 13 },
      { name: "DIGIT_5_EX", x: 45, y: 0, width: 9, height: 13 },
      { name: "DIGIT_6_EX", x: 54, y: 0, width: 9, height: 13 },
      { name: "DIGIT_7_EX", x: 63, y: 0, width: 9, height: 13 },
      { name: "DIGIT_8_EX", x: 72, y: 0, width: 9, height: 13 },
      { name: "DIGIT_9_EX", x: 81, y: 0, width: 9, height: 13 }
    ]
  },
  {
    name: "PLAYPAUS",
    sprites: [
      { name: "MAIN_PLAYING_INDICATOR", x: 0, y: 0, width: 9, height: 9 },
      { name: "MAIN_PAUSED_INDICATOR", x: 9, y: 0, width: 9, height: 9 },
      { name: "MAIN_STOPPED_INDICATOR", x: 18, y: 0, width: 9, height: 9 },
      { name: "MAIN_NOT_WORKING_INDICATOR", x: 36, y: 0, width: 9, height: 9 },
      { name: "MAIN_WORKING_INDICATOR", x: 39, y: 0, width: 9, height: 9 }
    ]
  },
  {
    name: "PLEDIT.BMP",
    sprites: [
      { name: "PLAYLIST_TOP_TILE", x: 127, y: 21, width: 25, height: 20 },
      { name: "PLAYLIST_TOP_LEFT_CORNER", x: 0, y: 21, width: 25, height: 20 },
      { name: "PLAYLIST_TITLE_BAR", x: 26, y: 21, width: 100, height: 20 },
      {
        name: "PLAYLIST_TOP_RIGHT_CORNER",
        x: 153,
        y: 21,
        width: 25,
        height: 20
      },
      {
        name: "PLAYLIST_TOP_TILE_SELECTED",
        x: 127,
        y: 0,
        width: 25,
        height: 20
      },
      { name: "PLAYLIST_TOP_LEFT_SELECTED", x: 0, y: 0, width: 25, height: 20 },
      {
        name: "PLAYLIST_TITLE_BAR_SELECTED",
        x: 26,
        y: 0,
        width: 100,
        height: 20
      },
      {
        name: "PLAYLIST_TOP_RIGHT_CORNER_SELECTED",
        x: 153,
        y: 0,
        width: 25,
        height: 20
      },
      { name: "PLAYLIST_LEFT_TILE", x: 0, y: 42, width: 25, height: 29 },
      { name: "PLAYLIST_RIGHT_TILE", x: 26, y: 42, width: 25, height: 29 },
      { name: "PLAYLIST_BOTTOM_TILE", x: 179, y: 0, width: 25, height: 38 },
      {
        name: "PLAYLIST_BOTTOM_LEFT_CORNER",
        x: 0,
        y: 72,
        width: 125,
        height: 38
      },
      {
        name: "PLAYLIST_BOTTOM_RIGHT_CORNER",
        x: 126,
        y: 72,
        width: 150,
        height: 38
      },
      {
        name: "PLAYLIST_VISUALIZER_BACKGROUND",
        x: 205,
        y: 0,
        width: 75,
        height: 38
      },
      { name: "PLAYLIST_SHADE_BACKGROUND", x: 72, y: 57, width: 25, height: 14 }
    ]
  },
  {
    name: "EQMAIN",
    sprites: [
      { name: "EQ_WINDOW_BACKGROUND", x: 0, y: 0, width: 275, height: 116 },
      { name: "EQ_TITLE_BAR", x: 0, y: 149, width: 275, height: 14 },
      { name: "EQ_TITLE_BAR_SELECTED", x: 0, y: 134, width: 275, height: 14 },
      { name: "EQ_SLIDER_BACKGROUND", x: 13, y: 164, width: 209, height: 129 },
      { name: "EQ_SLIDER_THUMB", x: 0, y: 164, width: 11, height: 11 },
      { name: "EQ_SLIDER_THUMB_SELECTED", x: 0, y: 176, width: 11, height: 11 },
      { name: "EQ_ON_BUTTON", x: 10, y: 119, width: 26, height: 12 },
      { name: "EQ_ON_BUTTON_DEPRESSED", x: 128, y: 119, width: 26, height: 12 },
      { name: "EQ_ON_BUTTON_SELECTED", x: 69, y: 119, width: 26, height: 12 },
      {
        name: "EQ_ON_BUTTON_SELECTED_DEPRESSED",
        x: 187,
        y: 119,
        width: 26,
        height: 12
      },
      { name: "EQ_AUTO_BUTTON", x: 36, y: 119, width: 32, height: 12 },
      {
        name: "EQ_AUTO_BUTTON_DEPRESSED",
        x: 154,
        y: 119,
        width: 32,
        height: 12
      },
      { name: "EQ_AUTO_BUTTON_SELECTED", x: 95, y: 119, width: 32, height: 12 },
      {
        name: "EQ_AUTO_BUTTON_SELECTED_DEPRESSED",
        x: 213,
        y: 119,
        width: 32,
        height: 12
      },
      { name: "EQ_GRAPH_BACKGROUND", x: 0, y: 294, width: 113, height: 19 },
      { name: "EQ_GRAPH_LINE_COLORS", x: 115, y: 294, width: 1, height: 19 },
      { name: "EQ_PRESETS_BUTTON", x: 224, y: 164, width: 44, height: 12 },
      {
        name: "EQ_PRESETS_BUTTON_SELECTED",
        x: 224,
        y: 176,
        width: 44,
        height: 12
      },
      { name: "EQ_PREAMP_LINE", x: 0, y: 314, width: 113, height: 1 }
    ]
  },
  {
    name: "POSBAR",
    sprites: [
      {
        name: "MAIN_POSITION_SLIDER_BACKGROUND",
        x: 0,
        y: 0,
        width: 248,
        height: 10
      },
      {
        name: "MAIN_POSITION_SLIDER_THUMB",
        x: 248,
        y: 0,
        width: 29,
        height: 10
      },
      {
        name: "MAIN_POSITION_SLIDER_THUMB_SELECTED",
        x: 278,
        y: 0,
        width: 29,
        height: 10
      }
    ]
  },
  {
    name: "SHUFREP",
    sprites: [
      { name: "MAIN_SHUFFLE_BUTTON", x: 28, y: 0, width: 47, height: 15 },
      {
        name: "MAIN_SHUFFLE_BUTTON_DEPRESSED",
        x: 28,
        y: 15,
        width: 47,
        height: 15
      },
      {
        name: "MAIN_SHUFFLE_BUTTON_SELECTED",
        x: 28,
        y: 30,
        width: 47,
        height: 15
      },
      {
        name: "MAIN_SHUFFLE_BUTTON_SELECTED_DEPRESSED",
        x: 28,
        y: 45,
        width: 47,
        height: 15
      },
      { name: "MAIN_REPEAT_BUTTON", x: 0, y: 0, width: 28, height: 15 },
      {
        name: "MAIN_REPEAT_BUTTON_DEPRESSED",
        x: 0,
        y: 15,
        width: 28,
        height: 15
      },
      {
        name: "MAIN_REPEAT_BUTTON_SELECTED",
        x: 0,
        y: 30,
        width: 28,
        height: 15
      },
      {
        name: "MAIN_REPEAT_BUTTON_SELECTED_DEPRESSED",
        x: 0,
        y: 45,
        width: 28,
        height: 15
      },
      { name: "MAIN_EQ_BUTTON", x: 0, y: 61, width: 23, height: 12 },
      { name: "MAIN_EQ_BUTTON_SELECTED", x: 0, y: 73, width: 23, height: 12 },
      { name: "MAIN_EQ_BUTTON_DEPRESSED", x: 46, y: 61, width: 23, height: 12 },
      {
        name: "MAIN_EQ_BUTTON_DEPRESSED_SELECTED",
        x: 46,
        y: 73,
        width: 23,
        height: 12
      },
      { name: "MAIN_PLAYLIST_BUTTON", x: 23, y: 61, width: 23, height: 12 },
      {
        name: "MAIN_PLAYLIST_BUTTON_SELECTED",
        x: 23,
        y: 73,
        width: 23,
        height: 12
      },
      {
        name: "MAIN_PLAYLIST_BUTTON_DEPRESSED",
        x: 69,
        y: 61,
        width: 23,
        height: 12
      },
      {
        name: "MAIN_PLAYLIST_BUTTON_DEPRESSED_SELECTED",
        x: 69,
        y: 62,
        width: 23,
        height: 12
      }
    ]
  },
  {
    name: "TEXT",
    sprites: characterSprites
  },
  {
    name: "TITLEBAR",
    sprites: [
      { name: "MAIN_TITLE_BAR", x: 27, y: 15, width: 275, height: 14 },
      { name: "MAIN_TITLE_BAR_SELECTED", x: 27, y: 0, width: 275, height: 14 },
      {
        name: "MAIN_EASTER_EGG_TITLE_BAR",
        x: 27,
        y: 61,
        width: 275,
        height: 14
      },
      {
        name: "MAIN_EASTER_EGG_TITLE_BAR_SELECTED",
        x: 27,
        y: 57,
        width: 275,
        height: 14
      },
      { name: "MAIN_OPTIONS_BUTTON", x: 0, y: 0, width: 9, height: 9 },
      {
        name: "MAIN_OPTIONS_BUTTON_DEPRESSED",
        x: 0,
        y: 9,
        width: 9,
        height: 9
      },
      { name: "MAIN_MINIMIZE_BUTTON", x: 9, y: 0, width: 9, height: 9 },
      {
        name: "MAIN_MINIMIZE_BUTTON_DEPRESSED",
        x: 9,
        y: 9,
        width: 9,
        height: 9
      },
      { name: "MAIN_SHADE_BUTTON", x: 0, y: 18, width: 9, height: 9 },
      { name: "MAIN_SHADE_BUTTON_DEPRESSED", x: 9, y: 18, width: 9, height: 9 },
      { name: "MAIN_CLOSE_BUTTON", x: 18, y: 0, width: 9, height: 9 },
      { name: "MAIN_CLOSE_BUTTON_DEPRESSED", x: 18, y: 9, width: 9, height: 9 },
      {
        name: "MAIN_CLUTTER_BAR_BACKGROUND",
        x: 304,
        y: 0,
        width: 8,
        height: 43
      },
      {
        name: "MAIN_CLUTTER_BAR_BACKGROUND_DISABLED",
        x: 312,
        y: 0,
        width: 8,
        height: 43
      },
      {
        name: "MAIN_CLUTTER_BAR_BUTTON_O_SELECTED",
        x: 304,
        y: 47,
        width: 8,
        height: 8
      },
      {
        name: "MAIN_CLUTTER_BAR_BUTTON_A_SELECTED",
        x: 312,
        y: 55,
        width: 8,
        height: 7
      },
      {
        name: "MAIN_CLUTTER_BAR_BUTTON_I_SELECTED",
        x: 320,
        y: 62,
        width: 8,
        height: 7
      },
      {
        name: "MAIN_CLUTTER_BAR_BUTTON_D_SELECTED",
        x: 328,
        y: 69,
        width: 8,
        height: 8
      },
      {
        name: "MAIN_CLUTTER_BAR_BUTTON_V_SELECTED",
        x: 336,
        y: 77,
        width: 8,
        height: 7
      },
      { name: "MAIN_SHADE_BACKGROUND", x: 27, y: 42, width: 275, height: 14 },
      {
        name: "MAIN_SHADE_BACKGROUND_SELECTED",
        x: 27,
        y: 29,
        width: 275,
        height: 14
      },
      { name: "MAIN_SHADE_BUTTON_SELECTED", x: 0, y: 27, width: 9, height: 9 },
      {
        name: "MAIN_SHADE_BUTTON_SELECTED_DEPRESSED",
        x: 9,
        y: 27,
        width: 9,
        height: 9
      },
      {
        name: "MAIN_SHADE_POSITION_BACKGROUND",
        x: 0,
        y: 36,
        width: 17,
        height: 7
      },
      { name: "MAIN_SHADE_POSITION_THUMB", x: 20, y: 36, width: 3, height: 7 },
      {
        name: "MAIN_SHADE_POSITION_THUMB_LEFT",
        x: 17,
        y: 36,
        width: 3,
        height: 7
      },
      {
        name: "MAIN_SHADE_POSITION_THUMB_RIGHT",
        x: 23,
        y: 36,
        width: 3,
        height: 7
      }
    ]
  },
  {
    name: "VOLUME",
    sprites: [
      { name: "MAIN_VOLUME_BACKGROUND", x: 0, y: 0, width: 68, height: 420 },
      { name: "MAIN_VOLUME_THUMB", x: 15, y: 422, width: 14, height: 11 },
      {
        name: "MAIN_VOLUME_THUMB_SELECTED",
        x: 0,
        y: 422,
        width: 14,
        height: 11
      }
    ]
  },
  {
    name: "VISCOLOR"
  },
  {
    name: "PLEDIT.TXT"
  }
];
