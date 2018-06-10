import React from "react";
import Presets from "./Presets";
import Milkdrop from "./Milkdrop";
import Background from "./Background";

// This component is just responsible for loading dependencies.
// This simplifies the inner <Milkdrop /> component, by allowing
// it to alwasy assume that it has it's dependencies.
export default class PresetsLoader extends React.Component {
  constructor() {
    super();
    this.state = { presets: null, butterchurn: null };
  }

  async componentDidMount() {
    const {
      butterchurn,
      presetKeys,
      minimalPresets
    } = await loadInitialDependencies();

    this.setState({
      butterchurn,
      presets: new Presets({
        keys: presetKeys,
        initialPresets: minimalPresets,
        getRest: loadNonMinimalPresets
      })
    });
  }

  render() {
    const { butterchurn, presets } = this.state;
    const loaded = butterchurn != null && presets != null;
    return loaded ? (
      <Milkdrop {...this.props} presets={presets} butterchurn={butterchurn} />
    ) : (
      <Background />
    );
  }
}

async function loadInitialDependencies() {
  return new Promise((resolve, reject) => {
    require.ensure(
      [
        "butterchurn",
        "butterchurn-presets/lib/butterchurnPresetsMinimal.min",
        "butterchurn-presets/lib/butterchurnPresetPackMeta.min"
      ],
      require => {
        const butterchurn = require("butterchurn");
        const butterchurnMinimalPresets = require("butterchurn-presets/lib/butterchurnPresetsMinimal.min");
        const presetPackMeta = require("butterchurn-presets/lib/butterchurnPresetPackMeta.min");
        resolve({
          butterchurn,
          minimalPresets: butterchurnMinimalPresets.getPresets(),
          presetKeys: presetPackMeta.getMainPresetMeta().presets
        });
      },
      reject,
      "butterchurn"
    );
  });
}

async function loadNonMinimalPresets() {
  return new Promise((resolve, reject) => {
    require.ensure(
      ["butterchurn-presets/lib/butterchurnPresetsNonMinimal.min"],
      require => {
        resolve(
          require("butterchurn-presets/lib/butterchurnPresetsNonMinimal.min").getPresets()
        );
      },
      reject,
      "butterchurn-presets"
    );
  });
}
