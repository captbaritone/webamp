import { Edges } from "./skin/Clippath";

document.getElementById("clickable").onclick = (ev) => {
  alert("click on green!");
};
document.getElementById("img1").onclick = (event) => {
  alert("click on IMAGE.");
  event.stopPropagation();
};

function main() {
  const oriImg = document.getElementById("img1");
  const preferedWidth = parseInt(oriImg.getAttribute("data-width"));
  const preferedHeight = parseInt(oriImg.getAttribute("data-height"));
  const img2 = new Image();
  img2.onload = (ev) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = img2.width;
    canvas.height = img2.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img2, 0, 0);
    const edge = new Edges();
    edge.parseCanvasTransparency(canvas, preferedWidth, preferedHeight);
    document.getElementById("top").textContent = edge
      .gettop()
      .replace(/px/gi, "")
      .replace(/\,\s/gi, "\n");
    document.getElementById("right").textContent = edge
      .getright()
      .replace(/px/gi, "")
      .replace(/\,\s/gi, "\n");
    document.getElementById("bottom").textContent = edge
      .getbottom()
      .replace(/px/gi, "")
      .replace(/\,\s/gi, "\n");
    document.getElementById("left").textContent = edge
      .getleft()
      .replace(/px/gi, "")
      .replace(/\,\s/gi, "\n");
    document.getElementById("app").style.clipPath = edge.getPolygon();
  };
  img2.setAttribute("src", oriImg.getAttribute("src"));
}

main();
