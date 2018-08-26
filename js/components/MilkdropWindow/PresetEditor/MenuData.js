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
          presetKey: ["baseVals", "ob_r"],
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
