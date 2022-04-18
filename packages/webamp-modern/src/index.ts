// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import UI_ROOT from "./UIRoot";
import { getUrlQuery } from "./utils";
import { addDropHandler } from "./dropTarget";
import { loadSkin } from "./skin/skinLoader";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

// temporary disable:
// addDropHandler(loadSkin);

const STATUS = document.getElementById("status");

function setStatus(status: string) {
  STATUS.innerText = status;
}

// const DEFAULT_SKIN = "assets/MMD3.wal"
const DEFAULT_SKIN = "assets/WinampModern566.wal";

async function main() {
  // Purposefully don't await, let this load in parallel.
  initializeSkinListMenu();

  changeSkinByUrl();

  setStatus("Downloading MP3...");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");
  UI_ROOT.playlist.enqueuefile("assets/Just_Plain_Ant_-_05_-_Stumble.mp3");

  setStatus("");
}

async function changeSkinByUrl() {
  setStatus("Downloading skin...");
  const skinPath = getUrlQuery(window.location, "skin") || DEFAULT_SKIN;
  // const response = await fetch(skinPath);
  // const data = await response.blob();
  // await loadSkin(data);
  await loadSkin(skinPath);
  setStatus("");
}

function gql(strings: TemplateStringsArray): string {
  return strings[0];
}

async function initializeSkinListMenu() {
  const query = gql`
    query {
      modern_skins(first: 1000) {
        nodes {
          filename
          download_url
        }
      }
    }
  `;

  const response = await fetch("https://api.webampskins.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    mode: "cors",
    credentials: "include",
    body: JSON.stringify({ query, variables: {} }),
  });

  const data = await response.json();

  const select = document.createElement("select");
  select.style.position = "absolute";
  select.style.bottom = "0";
  select.style.width = "300px";

  const downloadLink = document.createElement("a");
  downloadLink.style.position = "absolute";
  downloadLink.style.bottom = "0";
  downloadLink.style.left = "320px";
  downloadLink.text = "Download";

  const current = getUrlQuery(window.location, "skin");

  const internalSkins = [
    { filename: "default", download_url: "" },
    { filename: "MMD3", download_url: "assets/MMD3.wal" },
    { filename: "[Folder] MMD3", download_url: "assets/extracted/MMD3/" },
    { filename: "[Classic]", download_url: "assets/base-2.91.wsz" },
  ];

  const skins = [...internalSkins, ...data.data.modern_skins.nodes];

  for (const skin of skins) {
    const option = document.createElement("option");
    option.value = skin.download_url;
    option.textContent = skin.filename;
    if (current === skin.download_url) {
      option.selected = true;
      downloadLink.href = skin.download_url;
    }
    select.appendChild(option);
  }

  select.addEventListener("change", (e: any) => {
    const url = new URL(window.location.href);
    url.searchParams.set("skin", e.target.value);
    // window.location.replace(url.href);
    const title = e.target.text;
    const newPath = url.href.substring(url.origin.length);

    // https://stackoverflow.com/questions/3338642/updating-address-bar-with-new-url-without-hash-or-reloading-the-page
    window.history.pushState({ pageTitle: title }, title, newPath);
    changeSkinByUrl();

    downloadLink.href = e.target.value;
  });

  window.onpopstate = function (e) {
    if (e.state) {
      // document.getElementById("content").innerHTML = e.state.html;
      document.title = e.state.pageTitle;
      changeSkinByUrl();
    }
  };

  document.body.appendChild(select);
  document.body.appendChild(downloadLink);
}

main();
