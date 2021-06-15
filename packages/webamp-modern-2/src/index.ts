import JSZip from "jszip";
import SkinParser from "./skin/parse";

async function main() {
  const response = await fetch("assets/CornerAmp_Redux.wal");
  const data = await response.blob();
  const zip = await JSZip.loadAsync(data);

  const parser = new SkinParser(zip);

  await parser.parse();

  for (const container of parser._containers) {
    container.init({ containers: parser._containers });
  }

  let node = document.createElement("div");

  for (const container of parser._containers) {
    node.appendChild(container.getDebugDom());
  }

  document.body.appendChild(node);
  setInterval(() => {
    document.body.removeChild(node);
    node = document.createElement("div");
    for (const container of parser._containers) {
      node.appendChild(container.getDebugDom());
    }
    document.body.appendChild(node);
  }, 1000);
}

main();
