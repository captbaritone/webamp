/* TODO: There are too many " " and "_" characters */
var FONT_LOOKUP = {
  'a': [0, 0], 'b': [0, 1], 'c': [0, 2], 'd': [0, 3], 'e': [0, 4], 'f': [0, 5],
  'g': [0, 6], 'h': [0, 7], 'i': [0, 8], 'j': [0, 9], 'k': [0, 10],
  'l': [0, 11], 'm': [0, 12], 'n': [0, 13], 'o': [0, 14], 'p': [0, 15],
  'q': [0, 16], 'r': [0, 17], 's': [0, 18], 't': [0, 19], 'u': [0, 20],
  'v': [0, 21], 'w': [0, 22], 'x': [0, 23], 'y': [0, 24], 'z': [0, 25],
  '"': [0, 26], '@': [0, 27], '0': [1, 0], '1': [1, 1],
  '2': [1, 2], '3': [1, 3], '4': [1, 4], '5': [1, 5], '6': [1, 6], '7': [1, 7],
  '8': [1, 8], '9': [1, 9], '_': [1, 11], ':': [1, 12],
  '(': [1, 13], ')': [1, 14], '-': [1, 15], "'": [1, 16], '!': [1, 17],
  '+': [1, 19], '\\': [1, 20], '/': [1, 21], '[': [1, 22],
  ']': [1, 23], '^': [1, 24], '&': [1, 25], '%': [1, 26], '.': [1, 27],
  '=': [1, 28], '$': [1, 29], '#': [1, 30], 'Å': [2, 0], 'Ö': [2, 1],
  'Ä': [2, 2], '?': [2, 3], '*': [2, 4], ' ': [2, 5], '<': [1, 22],
  '>': [1, 23], '{': [1, 22], '}': [1, 23]
};

var CHAR_X = 5;
var CHAR_Y = 6;

var characterSprites = [];
for (var key in FONT_LOOKUP) {
  if (FONT_LOOKUP.hasOwnProperty(key)) {
    var position = FONT_LOOKUP[key];
    characterSprites.push({
      selectors: ['.character-' + key.charCodeAt(0)],
      y: position[0] * CHAR_Y,
      x: position[1] * CHAR_X,
      width: CHAR_X,
      height: CHAR_Y
    });
  }
}

module.exports = [
  {
    img: 'BALANCE',
    sprites: [
      {selectors: ['#balance'], x: 9, y: 0, width: 38, height: 420},
      {selectors: ['#balance::-webkit-slider-thumb', '#balance::-moz-range-thumb'], x: 15, y: 422, width: 14, height: 11},
      {selectors: ['#balance::-webkit-slider-thumb:active', '#balance::-moz-range-thumb:active'], x: 0, y: 422, width: 14, height: 11}
    ]
  },
  {
    img: 'CBUTTONS',
    sprites: [
      {selectors: ['.actions #previous'], x: 0, y: 0, width: 23, height: 18},
      {selectors: ['.actions #previous:active'], x: 0, y: 18, width: 23, height: 18},
      {selectors: ['.actions #play'], x: 23, y: 0, width: 23, height: 18},
      {selectors: ['.actions #play:active'], x: 23, y: 18, width: 23, height: 18},
      {selectors: ['.actions #pause'], x: 46, y: 0, width: 23, height: 18},
      {selectors: ['.actions #pause:active'], x: 46, y: 18, width: 23, height: 18},
      {selectors: ['.actions #stop'], x: 69, y: 0, width: 23, height: 18},
      {selectors: ['.actions #stop:active'], x: 69, y: 18, width: 23, height: 18},
      {selectors: ['.actions #next'], x: 92, y: 0, width: 23, height: 18},
      {selectors: ['.actions #next:active'], x: 92, y: 18, width: 22, height: 18},
      {selectors: ['#eject'], x: 114, y: 0, width: 22, height: 16},
      {selectors: ['#eject:active'], x: 114, y: 16, width: 22, height: 16}
    ]
  },
  {
    img: 'MAIN',
    sprites: [
      {selectors: ['#main-window'], x: 0, y: 0, width: 275, height: 116}
    ]
  },
  {
    img: 'MONOSTER',
    sprites: [
      {selectors: ['.media-info #stereo', '.stop .media-info #stereo.selected'], x: 0, y: 12, width: 29, height: 12},
      {selectors: ['.media-info #stereo.selected'], x: 0, y: 0, width: 29, height: 12},
      {selectors: ['.media-info #mono', '.stop .media-info #mono.selected'], x: 29, y: 12, width: 29, height: 12},
      {selectors: ['.media-info #mono.selected'], x: 29, y: 0, width: 29, height: 12}
    ]
  },
  {
    img: 'NUMBERS',
    sprites: [
      {selectors: ['#time #minus-sign'], x: 9, y: 6, width: 5, height: 1},
      {selectors: ['#time.countdown #minus-sign'], x: 20, y: 6, width: 5, height: 1},
      {selectors: ['.digit-0'], x: 0, y: 0, width: 9, height: 13},
      {selectors: ['.digit-1'], x: 9, y: 0, width: 9, height: 13},
      {selectors: ['.digit-2'], x: 18, y: 0, width: 9, height: 13},
      {selectors: ['.digit-3'], x: 27, y: 0, width: 9, height: 13},
      {selectors: ['.digit-4'], x: 36, y: 0, width: 9, height: 13},
      {selectors: ['.digit-5'], x: 45, y: 0, width: 9, height: 13},
      {selectors: ['.digit-6'], x: 54, y: 0, width: 9, height: 13},
      {selectors: ['.digit-7'], x: 63, y: 0, width: 9, height: 13},
      {selectors: ['.digit-8'], x: 72, y: 0, width: 9, height: 13},
      {selectors: ['.digit-9'], x: 81, y: 0, width: 9, height: 13}
    ]
  },
  {
    img: 'NUMS_EX',
    sprites: [
      {selectors: ['#time #minus-sign'], x: 90, y: 0, width: 9, height: 13},
      {selectors: ['#time.countdown #minus-sign'], x: 99, y: 0, width: 9, height: 13},
      {selectors: ['.digit-0'], x: 0, y: 0, width: 9, height: 13},
      {selectors: ['.digit-1'], x: 9, y: 0, width: 9, height: 13},
      {selectors: ['.digit-2'], x: 18, y: 0, width: 9, height: 13},
      {selectors: ['.digit-3'], x: 27, y: 0, width: 9, height: 13},
      {selectors: ['.digit-4'], x: 36, y: 0, width: 9, height: 13},
      {selectors: ['.digit-5'], x: 45, y: 0, width: 9, height: 13},
      {selectors: ['.digit-6'], x: 54, y: 0, width: 9, height: 13},
      {selectors: ['.digit-7'], x: 63, y: 0, width: 9, height: 13},
      {selectors: ['.digit-8'], x: 72, y: 0, width: 9, height: 13},
      {selectors: ['.digit-9'], x: 81, y: 0, width: 9, height: 13}
    ]
  },
  {
    img: 'PLAYPAUS',
    sprites: [
      {selectors: ['.play #play-pause'], x: 0, y: 0, width: 9, height: 9},
      {selectors: ['.pause #play-pause'], x: 9, y: 0, width: 9, height: 9},
      {selectors: ['.stop #play-pause'], x: 18, y: 0, width: 9, height: 9},
      {selectors: ['.play #work-indicator'], x: 36, y: 0, width: 9, height: 9},
      {selectors: ['.play #work-indicator.selected'], x: 39, y: 0, width: 9, height: 9}
    ]
  },
  /* {
     img: 'PLEDIT',
     sprites: [
     {selectors: ['.playlist-top-tile'], x: 127, y: 21, width: 25, height: 20},
     {selectors: ['.selected .playlist-top-tile'], x: 127, y: 0, width: 25, height: 20},
     {selectors: ['.playlist-left-tile'], x: 0, y: 42, width: 25, height: 29},
     {selectors: ['.playlist-right-tile'], x: 27, y: 42, width: 25, height: 29},
     {selectors: ['.playlist-bottom-tile'], x: 179, y: 0, width: 25, height: 38},
     {selectors: ['#playlist.shade'], x: 72, y: 57, width: 25, height: 14}
     ]
     }, */
  {
    img: 'POSBAR',
    sprites: [
      {selectors: ['#position'], x: 0, y: 0, width: 248, height: 10},
      {selectors: ['#position::-webkit-slider-thumb', '#position::-moz-range-thumb'], x: 248, y: 0, width: 29, height: 10},
      {selectors: ['#position:active::-webkit-slider-thumb', '#position:active::-moz-range-thumb'], x: 278, y: 0, width: 29, height: 10}
    ]
  },
  {
    img: 'SHUFREP',
    sprites: [
      {selectors: ['#shuffle'], x: 28, y: 0, width: 47, height: 15},
      {selectors: ['#shuffle:active'], x: 28, y: 15, width: 47, height: 15},
      {selectors: ['#shuffle.selected'], x: 28, y: 30, width: 47, height: 15},
      {selectors: ['#shuffle.selected:active'], x: 28, y: 45, width: 47, height: 15},
      {selectors: ['#repeat'], x: 0, y: 0, width: 28, height: 15},
      {selectors: ['#repeat:active'], x: 0, y: 15, width: 28, height: 15},
      {selectors: ['#repeat.selected'], x: 0, y: 30, width: 28, height: 15},
      {selectors: ['#repeat.selected:active'], x: 0, y: 45, width: 28, height: 15},
      {selectors: ['#equalizer-button'], x: 0, y: 61, width: 23, height: 12},
      {selectors: ['#equalizer-button:active'], x: 46, y: 61, width: 23, height: 12},
      {selectors: ['#playlist-button'], x: 23, y: 61, width: 23, height: 12},
      {selectors: ['#playlist-button:active'], x: 69, y: 61, width: 23, height: 12}
    ]
  },
  {
    img: 'TEXT',
    sprites: characterSprites
  },
  {
    img: 'TITLEBAR',
    sprites: [
      {selectors: ['#title-bar'], x: 27, y: 15, width: 275, height: 14},
      {selectors: ['#title-bar.selected'], x: 27, y: 0, width: 275, height: 14},
      {selectors: ['.llama #title-bar'], x: 27, y: 61, width: 275, height: 14},
      {selectors: ['.llama #title-bar.selected'], x: 27, y: 57, width: 275, height: 14},
      {selectors: ['#title-bar #option'], x: 0, y: 0, width: 9, height: 9},
      {selectors: ['#title-bar #option'], x: 0, y: 0, width: 9, height: 9},
      {selectors: ['#title-bar #option:active', '#title-bar #option:selected'], x: 0, y: 9, width: 9, height: 9},
      {selectors: ['#title-bar #minimize'], x: 9, y: 0, width: 9, height: 9},
      {selectors: ['#title-bar #minimize:active'], x: 9, y: 9, width: 9, height: 9},
      {selectors: ['#title-bar #shade'], x: 0, y: 18, width: 9, height: 9},
      {selectors: ['#title-bar #shade:active'], x: 9, y: 18, width: 9, height: 9},
      {selectors: ['#title-bar #close'], x: 18, y: 0, width: 9, height: 9},
      {selectors: ['#title-bar #close:active'], x: 18, y: 9, width: 9, height: 9},
      {selectors: ['#clutter-bar'], x: 304, y: 0, width: 8, height: 43},
      {selectors: ['#clutter-bar.disabled'], x: 312, y: 0, width: 8, height: 43},
      {selectors: ['#button-o:active', '#button-0:selected'], x: 304, y: 47, width: 8, height: 8},
      {selectors: ['#button-a:active', '#button-a.selected'], x: 312, y: 55, width: 8, height: 7},
      {selectors: ['#button-i:active', '#button-i.selected'], x: 320, y: 62, width: 8, height: 7},
      {selectors: ['#button-d:active', '#button-d.selected'], x: 328, y: 69, width: 8, height: 8},
      {selectors: ['#button-v:active', '#button-v.selected'], x: 336, y: 77, width: 8, height: 7},
      {selectors: ['.shade #title-bar'], x: 27, y: 42, width: 275, height: 14},
      {selectors: ['.shade #title-bar.selected'], x: 27, y: 29, width: 275, height: 14},
      {selectors: ['.shade #title-bar #shade'], x: 0, y: 27, width: 9, height: 9},
      {selectors: ['.shade #title-bar #shade:active'], x: 9, y: 27, width: 9, height: 9},
      {selectors: ['.shade #position'], x: 0, y: 36, width: 17, height: 7},
      {selectors: ['.shade #position::-moz-range-thumb', '.shade #position::-webkit-slider-thumb'], x: 20, y: 36, width: 3, height: 7},
      {selectors: ['.shade #position.left::-moz-range-thumb', '.shade #position.left::-webkit-slider-thumb'], x: 17, y: 36, width: 3, height: 7},
      {selectors: ['.shade #position.right::-moz-range-thumb', '.shade #position.right::-webkit-slider-thumb'], x: 23, y: 36, width: 3, height: 7}
    ]
  },
  {
    img: 'VOLUME',
    sprites: [
      {selectors: ['#volume'], x: 0, y: 0, width: 68, height: 420},
      {selectors: ['#volume::-webkit-slider-thumb', '#volume::-moz-range-thumb'], x: 15, y: 422, width: 14, height: 11},
      {selectors: ['#volume::-webkit-slider-thumb:active', '#volume::-moz-range-thumb:active'], x: 0, y: 422, width: 14, height: 11}
    ]
  }
];
