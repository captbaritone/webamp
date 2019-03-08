import { ButterchurnOptions } from "../../types";

async function loadConvertPreset() {
  const { convertPreset } =
    // prettier-ignore
    await import(
    /* webpackChunkName: "milkdrop-preset-converter" */
    // @ts-ignore
    "milkdrop-preset-converter-aws"
  );
  return convertPreset;
}
