import JSZip from "jszip";
// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import SkinParser from "./skin/parse";
import UI_ROOT from "./UIRoot";
import GammaGroup from "./skin/GammaGroup";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

async function main() {
  // const response = await fetch("assets/CornerAmp_Redux.wal");
  // const response = await fetch("assets/Default_winamp3_build499.wal");
  const response = await fetch("assets/MMD3.wal");
  const data = await response.blob();
  const zip = await JSZip.loadAsync(data);

  const parser = new SkinParser(zip);

  await parser.parse();

  let node = document.createElement("div");

  for (const container of parser._containers) {
    container.draw();
    node.appendChild(container.getDiv());
  }

  const gammaSet = UI_ROOT.getDefaultGammaSet();

  const div = document.createElement("div");
  div.innerHTML = makeGammaSetSVG(gammaSet);
  document.body.appendChild(div);

  document.body.appendChild(node);
  console.log("RENDER");

  for (const container of parser._containers) {
    container.init({ containers: parser._containers });
  }
  console.log("INIT");
}

function makeGammaSetSVG(gammaSet: GammaGroup[]) {
  // 4000,510,-4000
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
  <defs>
    ${gammaSet.map((group) => makeGammaGroupSVG(group)).join("\n")}
  </defs>
</svg>`;
}

function colorToFrac(num: string) {
  // -4096 to 4096
  return Number(num) / 4096;
}

// https://webplatform.github.io/docs/svg/elements/feFuncA/
// amplitude * pow(C, exponent) + offset (see below for amplitude, exponent, and offset)
// https://www.pawelporwisz.pl/winamp/wct_en.php
// TODO: Avoid XSS
function makeGammaGroupSVG(gammaGroup: GammaGroup) {
  const [r, g, b] = gammaGroup._value.split(",").map(colorToFrac);
  return `<filter id="${gammaGroup.getDomId()}" x="0" y="0" width="100%" height="100%">
  <feComponentTransfer>
    <feFuncR type="gamma" amplitude="1" exponent="1" offset="${r}" />
    <feFuncG type="gamma" amplitude="1" exponent="1" offset="${g}" />
    <feFuncB type="gamma" amplitude="1" exponent="1" offset="${b}" />
    
  </feComponentTransfer>
</filter>`;
}

main();
