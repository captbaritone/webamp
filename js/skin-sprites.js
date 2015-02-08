var SKIN_SPRITES = [
    {
        img: "MAIN",
        sprites: [
            { selectors: ["#main-window"], x: 0, y: 0, width: 275, height: 116}
        ]
    },
    {
        img: "NUMBERS",
        sprites: [
            { selectors: ["#time #minus-sign"], x: 9, y: 6, width: 5, height: 1},
            { selectors: ["#time.countdown #minus-sign"], x: 20, y: 6, width: 5, height: 1},
            { selectors: [".digit-0"], x: 0, y: 0, width: 9, height: 13},
            { selectors: [".digit-1"], x: 9, y: 0, width: 9, height: 13},
            { selectors: [".digit-2"], x: 18, y: 0, width: 9, height: 13},
            { selectors: [".digit-3"], x: 27, y: 0, width: 9, height: 13},
            { selectors: [".digit-4"], x: 36, y: 0, width: 9, height: 13},
            { selectors: [".digit-5"], x: 45, y: 0, width: 9, height: 13},
            { selectors: [".digit-6"], x: 54, y: 0, width: 9, height: 13},
            { selectors: [".digit-7"], x: 63, y: 0, width: 9, height: 13},
            { selectors: [".digit-8"], x: 72, y: 0, width: 9, height: 13},
            { selectors: [".digit-9"], x: 81, y: 0, width: 9, height: 13},
        ]
    },
    {
        img: "NUMS_EX",
        sprites: [
            { selectors: ["#time.ex #minus-sign"], x: 90, y: 0, width: 9, height: 13},
            { selectors: ["#time.ex.countdown #minus-sign"], x: 99, y: 0, width: 9, height: 13},
            { selectors: [".digit-0"], x: 0, y: 0, width: 9, height: 13},
            { selectors: [".digit-1"], x: 9, y: 0, width: 9, height: 13},
            { selectors: [".digit-2"], x: 18, y: 0, width: 9, height: 13},
            { selectors: [".digit-3"], x: 27, y: 0, width: 9, height: 13},
            { selectors: [".digit-4"], x: 36, y: 0, width: 9, height: 13},
            { selectors: [".digit-5"], x: 45, y: 0, width: 9, height: 13},
            { selectors: [".digit-6"], x: 54, y: 0, width: 9, height: 13},
            { selectors: [".digit-7"], x: 63, y: 0, width: 9, height: 13},
            { selectors: [".digit-8"], x: 72, y: 0, width: 9, height: 13},
            { selectors: [".digit-9"], x: 81, y: 0, width: 9, height: 13},
        ]
    },
    {
        img: "PLAYPAUS",
        sprites: [
            { selectors: [".play #play-pause"], x: 0, y: 0, width: 9, height: 9},
            { selectors: [".pause #play-pause"], x: 9, y: 0, width: 9, height: 9},
            { selectors: [".stop #play-pause"], x: 18, y: 0, width: 9, height: 9},
            { selectors: [".play #work-indicator"], x: 36, y: 0, width: 9, height: 9},
            { selectors: [".play #work-indicator.selected"], x: 39, y: 0, width: 9, height: 9}
        ]
    },
    /* {
        img: "PLEDIT",
        sprites: [
            { selectors: [".playlist-top-tile"], x: 127, y: 21, width: 25, height: 20},
            { selectors: [".selected .playlist-top-tile"], x: 127, y: 0, width: 25, height: 20},
            { selectors: [".playlist-left-tile"], x: 0, y: 42, width: 25, height: 29},
            { selectors: [".playlist-right-tile"], x: 27, y: 42, width: 25, height: 29},
            { selectors: [".playlist-bottom-tile"], x: 179, y: 0, width: 25, height: 38},
            { selectors: ["#playlist.shade"], x: 72, y: 57, width: 25, height: 14}
        ]
    }, */
    {
        img: "TITLEBAR",
        sprites: [
            { selectors: ["#title-bar"], x: 27, y: 15, width: 275, height: 14},
            { selectors: ["#title-bar.selected"], x: 27, y: 0, width: 275, height: 14},
            { selectors: [".lllama #title-bar"], x: 27, y: 61, width: 275, height: 14},
            { selectors: [".lllama #title-bar.selected"], x: 27, y: 57, width: 275, height: 14},
            { selectors: ["#title-bar #option"], x: 0, y: 0, width: 9, height: 9},
            { selectors: ["#title-bar #option"], x: 0, y: 0, width: 9, height: 9},
            { selectors: ["#title-bar #option:active", "#title-bar #option:selected"], x: 0, y: 9, width: 9, height: 9},
            { selectors: ["#title-bar #minimize"], x: 9, y: 0, width: 9, height: 9},
            { selectors: ["#title-bar #minimize:active"], x: 9, y: 9, width: 9, height: 9},
            { selectors: ["#title-bar #shade"], x: 0, y: 18, width: 9, height: 9},
            { selectors: ["#title-bar #shade:active"], x: 9, y: 18, width: 9, height: 9},
            { selectors: ["#title-bar #close"], x: 18, y: 0, width: 9, height: 9},
            { selectors: ["#title-bar #close:active"], x: 18, y: 9, width: 9, height: 9},
            { selectors: ["#clutter-bar"], x: 304, y: 0, width: 8, height: 43},
            { selectors: ["#clutter-bar.disabled"], x: 312, y: 0, width: 8, height: 43},
            { selectors: ["#button-o:active", "#button-0:selected"], x: 304, y: 47, width: 8, height: 8},
            { selectors: ["#button-a:active", "#button-a.selected"], x: 312, y: 55, width: 8, height: 7},
            { selectors: ["#button-i:active", "#button-i.selected"], x: 320, y: 62, width: 8, height: 7},
            { selectors: ["#button-d:active", "#button-d.selected"], x: 328, y: 69, width: 8, height: 8},
            { selectors: ["#button-v:active", "#button-v.selected"], x: 336, y: 77, width: 8, height: 7},
            { selectors: [".shade #title-bar"], x: 27, y: 42, width: 275, height: 14},
            { selectors: [".shade #title-bar.selected"], x: 27, y: 29, width: 275, height: 14},
            { selectors: [".shade #title-bar #shade"], x: 0, y: 27, width: 9, height: 9},
            { selectors: [".shade #title-bar #shade:active"], x: 9, y: 27, width: 9, height: 9}
        ]
    },
];
