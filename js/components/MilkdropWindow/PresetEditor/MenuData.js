const menuData = {
  items: [
    {
      name: "--MOTION",
      meta:
        "navigation: ESC: exit, Left Arrow: back, Right Arrow: select, UP/DOWN: change sel",
      items: [
        {
          name: "zoom amount",
          meta:
            "controls inward/outward motion. 0.9=zoom out, 1.0=no zoom, 1.1=zoom in",
          type: "float",
          presetKey: ["baseVals", "zoom"],
          default: 1
        },
        {
          name: " zoom exponent",
          meta: "controls the curvature of the zoom; 1=normal",
          type: "float",
          presetKey: ["baseVals", "zoom_exp"],
          default: 1
        },
        {
          name: "warp amount",
          meta:
            "controls the magnitude of the warping; 0=none, 1=normal, 2=major warping...",
          type: "float",
          presetKey: ["baseVals", "warp"],
          default: 1
        },
        {
          name: " warp scale",
          meta:
            "controls the wavelength of the warp; 1=normal, less=turbulent, more=smoother",
          type: "float",
          presetKey: ["baseVals", "warp_scale"],
          default: 1
        },
        {
          name: " warp speed",
          meta:
            "controls the speed of the warp; 1=normal, less=slower, more=faster",
          type: "float",
          presetKey: ["baseVals", "warp_speed"],
          default: 1
        },
        {
          name: "rotation amount",
          meta:
            "controls the amount of rotation.  0=none, 0.1=slightly right, -0.1=slightly clockwise, 0.1=CCW",
          type: "float",
          presetKey: ["baseVals", "rot"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: " rot., center of (X)",
          meta:
            "controls where the center of rotation is, horizontally.  0=left, 0.5=center, 1=right",
          type: "float",
          presetKey: ["baseVals", "cx"],
          default: 0.5,
          min: -1,
          max: 2
        },
        {
          name: " rot., center of (Y)",
          meta:
            "controls where the center of rotation is, vertically.  0=top, 0.5=center, 1=bottom",
          type: "float",
          presetKey: ["baseVals", "cx"],
          default: 0.5,
          min: -1,
          max: 2
        },
        {
          name: "translation (X)",
          meta:
            "controls amount of constant horizontal motion; -0.01 = slight shift right, 0=none, 0.01 = to left",
          type: "float",
          presetKey: ["baseVals", "dx"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: "translation (Y)",
          meta:
            "controls amount of constant vertical motion; -0.01 = slight shift downward, 0=none, 0.01 = upward",
          type: "float",
          presetKey: ["baseVals", "dy"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: "scaling (X)",
          meta:
            "controls amount of constant horizontal stretching; 0.99=shrink, 1=normal, 1.01=stretch",
          type: "float",
          presetKey: ["baseVals", "sx"],
          default: 1
        },
        {
          name: "scaling (Y)",
          meta:
            "controls amount of constant vertical stretching; 0.99=shrink, 1=normal, 1.01=stretch",
          type: "float",
          presetKey: ["baseVals", "sy"],
          default: 1
        }
      ]
    },
    {
      name: "--drawing: simple waveform",
      meta:
        "navigation: ESC: exit, Left Arrow: back, Right Arrow: select, UP/DOWN: change sel",
      items: [
        {
          name: "wave type",
          meta: "each value represents a different way of drawing the waveform",
          type: "int",
          presetKey: ["baseVals", "wave_mode"],
          default: 0,
          min: 0,
          max: 8
        },
        {
          name: "size",
          meta: "relative size of the waveform",
          type: "float",
          presetKey: ["baseVals", "wave_scale"],
          default: 1
        },
        {
          name: "smoothing",
          meta:
            "controls the smoothness of the waveform; 0=natural sound data (no smoothing), 0.9=max. smoothing",
          type: "float",
          presetKey: ["baseVals", "wave_smoothing"],
          default: 0.75,
          min: 0,
          max: 0.9
        },
        {
          name: "mystery parameter",
          meta:
            "what this one does is a secret (actually, its effect depends on the 'wave type'",
          type: "float",
          presetKey: ["baseVals", "wave_param"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: "position (X)",
          meta:
            "position of the waveform: 0 = far left edge of screen, 0.5 = center, 1 = far right",
          type: "float",
          presetKey: ["baseVals", "wave_x"],
          default: 0.5,
          min: 0,
          max: 1
        },
        {
          name: "position (Y)",
          meta:
            "position of the waveform: 0 = very bottom of screen, 0.5 = center, 1 = top",
          type: "float",
          presetKey: ["baseVals", "wave_y"],
          default: 0.5,
          min: 0,
          max: 1
        },
        {
          name: "color (red)",
          meta: "amount of red color in the wave (0..1)",
          type: "float",
          presetKey: ["baseVals", "wave_r"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: "color (green)",
          meta: "amount of green color in the wave (0..1)",
          type: "float",
          presetKey: ["baseVals", "wave_g"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: "color (blue)",
          meta: "amount of blue color in the wave (0..1)",
          type: "float",
          presetKey: ["baseVals", "wave_b"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: "opacity",
          meta: "opacity of the waveform; lower numbers = more transparent",
          type: "float",
          presetKey: ["baseVals", "wave_a"],
          default: 0.8,
          min: 0,
          max: 1
        },
        {
          name: "use dots",
          meta: "if true, the waveform is drawn as dots (instead of lines)",
          type: "bool",
          presetKey: ["baseVals", "wave_dots"],
          default: 0
        },
        {
          name: "draw thick",
          meta:
            "if true, the waveform's lines (or dots) are drawn with double thickness",
          type: "bool",
          presetKey: ["baseVals", "wave_thick"],
          default: 0
        },
        {
          name: "modulate opacity by volume",
          meta:
            "if true, the waveform opacity is affected by the music's volume",
          type: "bool",
          presetKey: ["baseVals", "modwavealphabyvolume"],
          default: 0
        },
        {
          name: "modulation: transparent volume",
          meta:
            "when the relative volume hits this level, the wave becomes transparent.  1 = normal loudness, 0.5 = extremely quiet, 1.5 = extremely loud",
          type: "float",
          presetKey: ["baseVals", "modwavealphastart"],
          default: 0.75,
          min: 0,
          max: 2
        },
        {
          name: "modulation: opaque volume",
          meta:
            "when the relative volume hits this level, the wave becomes opaque.  1 = normal loudness, 0.5 = extremely quiet, 1.5 = extremely loud",
          type: "float",
          presetKey: ["baseVals", "modwavealphaend"],
          default: 0.95,
          min: 0,
          max: 2
        },
        {
          name: "additive drawing",
          meta:
            "if true, the wave is drawn additively, saturating the image at white",
          type: "bool",
          presetKey: ["baseVals", "additivewave"],
          default: 0
        },
        {
          name: "color brightening",
          meta:
            "if true, the red, green, and blue color components will be scaled up until at least one of them reaches 1.0",
          type: "bool",
          presetKey: ["baseVals", "wave_brighten"],
          default: 1
        }
      ]
    },
    {
      name: "--drawing: borders, motion vectors",
      meta:
        "navigation: ESC: exit, Left Arrow: back, Right Arrow: select, UP/DOWN: change sel",
      items: [
        {
          name: "outer border thickness",
          meta:
            "thickness of the outer border drawn at the edges of the screen",
          type: "float",
          presetKey: ["baseVals", "ob_size"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " color (red)",
          meta: "amount of red color in the outer border",
          type: "float",
          presetKey: ["baseVals", "ob_r"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " color (green)",
          meta: "amount of green color in the outer border",
          type: "float",
          presetKey: ["baseVals", "ob_g"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " color (blue)",
          meta: "amount of blue color in the outer border",
          type: "float",
          presetKey: ["baseVals", "ob_b"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " opacity",
          meta: "opacity of the outer border (0=transparent, 1=opaque)",
          type: "float",
          presetKey: ["baseVals", "ob_a"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "inner border thickness",
          meta:
            "thickness of the inner border drawn at the edges of the screen",
          type: "float",
          presetKey: ["baseVals", "ib_size"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " inner color (red)",
          meta: "amount of red color in the inner border",
          type: "float",
          presetKey: ["baseVals", "ib_r"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " inner color (green)",
          meta: "amount of green color in the inner border",
          type: "float",
          presetKey: ["baseVals", "ib_g"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " inner color (blue)",
          meta: "amount of blue color in the inner border",
          type: "float",
          presetKey: ["baseVals", "ib_b"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: " inner opacity",
          meta: "opacity of the inner border (0=transparent, 1=opaque)",
          type: "float",
          presetKey: ["baseVals", "ib_a"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "motion vector opacity",
          meta: "opacity of the motion vectors (0=transparent, 1=opaque)",
          type: "float",
          presetKey: ["baseVals", "mv_a"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: " num. mot. vectors (X)",
          meta: "the number of motion vectors on the x-axis",
          type: "float",
          presetKey: ["baseVals", "mv_x"],
          default: 12,
          min: 0,
          max: 64
        },
        {
          name: " num. mot. vectors (Y)",
          meta: "the number of motion vectors on the y-axis",
          type: "float",
          presetKey: ["baseVals", "mv_y"],
          default: 9,
          min: 0,
          max: 48
        },
        {
          name: " offset (X)",
          meta: "horizontal placement offset of the motion vectors",
          type: "float",
          presetKey: ["baseVals", "mv_dx"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: " offset (Y)",
          meta: "vertical placement offset of the motion vectors",
          type: "float",
          presetKey: ["baseVals", "mv_dy"],
          default: 0,
          min: -1,
          max: 1
        },
        {
          name: " trail length",
          meta: "the length of the motion vectors (1=normal)",
          type: "float",
          presetKey: ["baseVals", "mv_l"],
          default: 0.9,
          min: 0,
          max: 5
        },
        {
          name: " motion vector color (red)",
          meta: "amount of red color in the motion vectors",
          type: "float",
          presetKey: ["baseVals", "mv_r"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: " motion vector color (green)",
          meta: "amount of green color in the motion vectors",
          type: "float",
          presetKey: ["baseVals", "mv_g"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: " motion vector color (blue)",
          meta: "amount of blue color in the motion vectors",
          type: "float",
          presetKey: ["baseVals", "mv_b"],
          default: 1,
          min: 0,
          max: 1
        }
      ]
    },
    {
      name: "--post-processing, misc.",
      meta:
        "navigation: ESC: exit, Left Arrow: back, Right Arrow: select, UP/DOWN: change sel",
      items: [
        {
          name: "sustain level",
          meta:
            "controls the eventual fade to black; 1=no fade, 0.9=strong fade; 0.98=recommended.",
          type: "float",
          presetKey: ["baseVals", "decay"],
          default: 0.98,
          min: 0,
          max: 1
        },
        {
          name: "darken center",
          meta:
            "when ON, help keeps the image from getting too bright by continually dimming the center point",
          type: "bool",
          presetKey: ["baseVals", "darken_center"],
          default: 0
        },
        {
          name: "gamma adjustment",
          meta: "controls brightness; 1=normal, 2=double, 3=triple, etc.",
          type: "float",
          presetKey: ["baseVals", "gammaadj"],
          default: 2,
          min: 1,
          max: 8
        },
        {
          name: "hue shader",
          meta: "adds subtle color variations to the image.  0=off, 1=fully on",
          type: "float",
          presetKey: ["baseVals", "fshader"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "video echo: alpha",
          meta:
            "controls the opacity of the second graphics layer; 0=transparent (off), 0.5=half-mix, 1=opaque",
          type: "float",
          presetKey: ["baseVals", "echo_alpha"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "video echo: zoom",
          meta: "controls the size of the second graphics layer",
          type: "float",
          presetKey: ["baseVals", "echo_zoom"],
          default: 2
        },
        {
          name: "video echo: alpha",
          meta:
            "selects an orientation for the second graphics layer.  0=normal, 1=flip on x, 2=flip on y, 3=flip on both",
          type: "int",
          presetKey: ["baseVals", "echo_orient"],
          default: 0,
          min: 0,
          max: 3
        },
        {
          name: "texture wrap",
          meta:
            "sets whether or not screen elements can drift off of one side and onto the other",
          type: "bool",
          presetKey: ["baseVals", "wrap"],
          default: 1
        },
        {
          name: "filter: invert",
          meta: "inverts the colors in the image",
          type: "bool",
          presetKey: ["baseVals", "invert"],
          default: 0
        },
        {
          name: "filter: brighten",
          meta:
            "brightens the darker parts of the image (nonlinear; square root filter)",
          type: "bool",
          presetKey: ["baseVals", "brighten"],
          default: 0
        },
        {
          name: "filter: darken",
          meta:
            "darkens the brighter parts of the image (nonlinear; squaring filter)",
          type: "bool",
          presetKey: ["baseVals", "darken"],
          default: 0
        },
        {
          name: "filter: solarize",
          meta: "emphasizes mid-range colors",
          type: "bool",
          presetKey: ["baseVals", "solarize"],
          default: 0
        },
        {
          name: "blur1: edge darken amount",
          meta:
            "keep this >0.25 to avoid edge artifacts, and <1.0 to avoid black borders.",
          type: "float",
          presetKey: ["baseVals", "b1ed"],
          default: 0.25,
          min: 0,
          max: 1
        },
        {
          name: "blur1: min color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.",
          type: "float",
          presetKey: ["baseVals", "b1n"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "blur1: max color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.",
          type: "float",
          presetKey: ["baseVals", "b1x"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: "blur2: min color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.  MUST BE SUBSET OF BLUR1 RANGE.",
          type: "float",
          presetKey: ["baseVals", "b2n"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "blur2: max color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.  MUST BE SUBSET OF BLUR1 RANGE.",
          type: "float",
          presetKey: ["baseVals", "b2x"],
          default: 1,
          min: 0,
          max: 1
        },
        {
          name: "blur3: min color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.  MUST BE SUBSET OF BLUR1, BLUR2 RANGES.",
          type: "float",
          presetKey: ["baseVals", "b3n"],
          default: 0,
          min: 0,
          max: 1
        },
        {
          name: "blur3: max color value",
          meta:
            "narrowing these to just the color range you need will greatly increase color fidelity in the blurred images.  MUST BE SUBSET OF BLUR1, BLUR2 RANGES.",
          type: "float",
          presetKey: ["baseVals", "b3x"],
          default: 1,
          min: 0,
          max: 1
        }
      ]
    },
    {
      name: "[ edit warp shader ]",
      meta:
        "This pixel shader drives the warping, color, etc. of the internal image each frame.",
      type: "text",
      presetKey: ["warp"]
    },
    {
      name: "[ edit composite shader ]",
      meta:
        "This pixel shader drives the final presentation of the internal image to the screen each frame.",
      type: "text",
      presetKey: ["comp"]
    }
  ]
};

function getMenuItem(key) {
  if (key.length === 0) {
    return menuData;
  }

  let selectedMenuItem = menuData;
  for (let i = 0; i < key.length; i++) {
    const menuKey = key[i];
    for (let j = 0; j < selectedMenuItem.items.length; j++) {
      const menuItem = selectedMenuItem.items[j];
      if (menuItem.name === menuKey) {
        selectedMenuItem = menuItem;
        break;
      }
    }
  }

  return selectedMenuItem;
}

export { menuData, getMenuItem };
