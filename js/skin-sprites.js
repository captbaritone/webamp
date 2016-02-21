define([], function() {
  return [
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
        {selectors: ['#time.ex #minus-sign'], x: 90, y: 0, width: 9, height: 13},
        {selectors: ['#time.ex.countdown #minus-sign'], x: 99, y: 0, width: 9, height: 13},
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
      sprites: [
        {selectors: ['.character'], x: 0, y: 0, width: 155, height: 74}
      ]
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
});
