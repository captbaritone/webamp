import JSZip from "jszip";
import SkinParser from "./skin/parse";

async function main() {
  const response = await fetch("assets/CornerAmp_Redux.wal");
  const data = await response.blob();
  const zip = await JSZip.loadAsync(data);

  const parser = new SkinParser(zip);

  await parser.parse();

  for (const container of parser._containers) {
    container.init();
  }

  for (const container of parser._containers) {
    document.body.appendChild(container.getDebugDom());
  }
}

main();
