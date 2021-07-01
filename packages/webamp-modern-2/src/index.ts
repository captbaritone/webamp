import JSZip from "jszip";
// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import SkinParser from "./skin/parse";
import UI_ROOT from "./UIRoot";

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

  UI_ROOT.enableDefaultGammaSet();

  for (const container of parser._containers) {
    container.draw();
    node.appendChild(container.getDiv());
  }

  const select = document.createElement("select");
  select.style.position = "absolute";
  select.style.bottom = "0px";
  select.style.left = "0px";
  select.addEventListener("change", (e) => {
    console.log(e.target.value);
    UI_ROOT.enableGammaSet(e.target.value);
  });
  for (const set of UI_ROOT._gammaSets.keys()) {
    const option = document.createElement("option");
    option.innerText = set;
    option.value = set;
    select.appendChild(option);
  }

  document.body.appendChild(select);

  const div = document.createElement("div");
  document.body.appendChild(div);

  document.body.appendChild(node);
  console.log("RENDER");

  for (const container of parser._containers) {
    container.init({ containers: parser._containers });
  }
  console.log("INIT");
}

main();
