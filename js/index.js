import "babel-polyfill";

import Winamp from "./winamp";
import Browser from "./browser";
import { hideAbout } from "./config";

if (new Browser(window).isCompatible) {
  if (hideAbout) {
    document.getElementsByClassName("about")[0].style.visibility = "hidden";
  }

  new Winamp({}).render(document.getElementById("winamp2-js"));
} else {
  document.getElementById("browser-compatibility").style.display = "block";
}
