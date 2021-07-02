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
  const status = document.getElementById("status");
  status.innerText = "Downloading skin...";
  // const response = await fetch("assets/CornerAmp_Redux.wal");
  // const response = await fetch("assets/Default_winamp3_build499.wal");
  const response = await fetch("assets/MMD3.wal");
  const data = await response.blob();
  status.innerText = "Loading .wal archive...";
  const zip = await JSZip.loadAsync(data);

  status.innerText = "Parsing XML and initializing images...";
  const parser = new SkinParser(zip);

  await parser.parse();

  UI_ROOT.setContainers(parser._containers);

  let node = document.createElement("div");

  status.innerText = "Enabling Colors...";
  UI_ROOT.enableDefaultGammaSet();

  status.innerText = "Rendering skin for the first time...";
  for (const container of parser._containers) {
    container.draw();
    node.appendChild(container.getDiv());
  }

  const select = document.createElement("select");
  select.style.position = "absolute";
  select.style.bottom = "0px";
  select.style.left = "0px";
  select.addEventListener("change", (e) => {
    UI_ROOT.enableGammaSet((e.target as HTMLInputElement).value);
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

  status.innerText = "Initializing Maki...";
  for (const container of parser._containers) {
    container.init();
  }
  status.innerText = "";
}

main();
