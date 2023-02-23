// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import { normalizedObjects, getFormattedId } from "./maki/objects";
import BaseObject from "./skin/makiClasses/BaseObject";
import { parse as parseMaki1 } from "./maki/parser";
import { parse as parseMakiXp, ParsedMaki } from "./maki/parserXp";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

/*
async function validateSkinMaki(file: Blob) {
  const zip = await JSZip.loadAsync(file);
  const maki = zip.filter((path) => path.endsWith(".maki"));
  for (const zipFile of maki) {
    console.log(zipFile.name);
    const arraybuffer = await zip.loadAsync("arraybuffer");
    console.log(arraybuffer);
  }
}

addDropHandler(validateSkinMaki);
*/

function getClass(guid: string): typeof BaseObject | null {
  try {
    return classResolver(guid);
  } catch (e) {
    return null;
  }
}
const panel = document.getElementById("panel");
const totals = document.createElement("div");
panel.appendChild(totals);
const table = document.createElement("table");
panel.appendChild(table);

const header = document.createElement("tr");
const nameHeader = document.createElement("th");
nameHeader.innerText = "Class Name";
header.appendChild(nameHeader);
const methodHeader = document.createElement("th");
methodHeader.innerText = "Methods";
header.appendChild(methodHeader);

table.appendChild(header);

const classes = [];

let total = 0;
let found = 0;
let dummy = 0;

// const params = new Proxy(new URLSearchParams(window.location.search), {
//     get: (searchParams, prop) => searchParams.get(prop),
// });
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
// let value = params.maki; // "some_value"
const url = new URL(window.location.href);
let makiPath = url.searchParams.get("maki"); // "some_value"
console.log("maki:", makiPath);
if (!makiPath) {
  makiPath = "/assets/MMD3/scripts/songinfo.maki";
  url.searchParams.set("maki", makiPath);
  window.history.pushState({ pageTitle: "title" }, "title", url);
  // window.location.assign(url.href)
}

async function main() {
  // async function getFileAsBytes(filePath: string): Promise<ArrayBuffer> {
  // const response = await
  fetch(makiPath).then(async (response) => {
    const scriptContents: ArrayBuffer = await response.arrayBuffer();
    if (scriptContents == null) {
      `ScriptFile file not found at path ${makiPath}`;
    } else {
      const parsedScriptXp = parseMakiXp(scriptContents);
      const parsedScript1 = parseMaki1(scriptContents, makiPath);
      explore(parsedScriptXp, parsedScript1);
    }
    // return scriptContents
  });
}

declare global {
  interface Window {
    ace: any;
  }
}

function explore(makiXp: ParsedMaki, maki: ParsedMaki) {
  const scriptXp = JSON.stringify(makiXp, null, "\t");
  const script = JSON.stringify(maki, null, "\t");
  updateEditor(scriptXp, "editor1");
  updateEditor(script, "editor2");
}
function updateEditor(txt: string, elementId: string) {
  const div = document.getElementById(elementId);
  div.textContent = txt;
  var editor = window.ace.edit(elementId);
  // editor.setTheme("ace/theme/monokai");
  editor.setTheme("ace/theme/merbivore");
  editor.getSession().setMode("ace/mode/json");
}
// this._scripts[file] = scriptContents;

main();

methodHeader.innerText += ` (${found}/${total}, ${Math.round(
  (found / total) * 100
)}% Complete) | ${Math.round(((found - dummy) / total) * 100)}% Real.`;
