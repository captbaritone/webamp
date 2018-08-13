const CONVERT_URL =
  "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter";

export default class PresetConverter {
  constructor({ getPresetConverter }) {
    this._getPresetConverter = getPresetConverter; // An async function to get the preset conversion libs
  }

  async _convertHLSL(text) {
    if (!text) {
      return "";
    }

    const response = await fetch(CONVERT_URL, {
      method: "POST",
      body: JSON.stringify({
        optimize: false,
        shader: text
      })
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const responseBody = await response.json();
    return responseBody.shader;
  }

  _optimizeShader(milkdropPresetUtils, optimizeGLSL, text) {
    if (text.length === 0) {
      return text;
    }

    let optimizedShader = optimizeGLSL(text);
    optimizedShader = milkdropPresetUtils.processOptimizedShader(
      optimizedShader
    );

    return optimizedShader;
  }

  async _convertShader(milkdropPresetUtils, optimizeGLSL, text) {
    try {
      const shader = milkdropPresetUtils.prepareShader(text);
      const convertedShader = await this._convertHLSL(shader);
      const optimizedShader = this._optimizeShader(
        milkdropPresetUtils,
        optimizeGLSL,
        convertedShader
      );
      return optimizedShader;
    } catch (e) {
      return "";
    }
  }

  async convertPreset(text) {
    const {
      milkdropPresetUtils,
      milkdropParser,
      optimizeGLSL
    } = await this._getPresetConverter();

    let mainPresetText = text.split("[preset00]")[1];
    mainPresetText = mainPresetText.replace(/\r\n/g, "\n");

    const presetParts = milkdropPresetUtils.splitPreset(mainPresetText);
    const parsedPreset = milkdropParser.convert_preset_wave_and_shape(
      presetParts.presetVersion,
      presetParts.presetInit,
      presetParts.perFrame,
      presetParts.perVertex,
      presetParts.shapes,
      presetParts.waves
    );
    const presetMap = milkdropPresetUtils.createBasePresetFuns(
      parsedPreset,
      presetParts.shapes,
      presetParts.waves
    );

    const [warpShader, compShader] = await Promise.all([
      this._convertShader(milkdropPresetUtils, optimizeGLSL, presetParts.warp),
      this._convertShader(milkdropPresetUtils, optimizeGLSL, presetParts.comp)
    ]);

    return Object.assign({}, presetMap, {
      baseVals: presetParts.baseVals,
      warp: warpShader,
      comp: compShader
    });
  }
}
