function getOffset(element, fromElement) {
  var el = element,
    offsetLeft = 0,
    offsetTop = 0;

  do {
    offsetLeft += el.offsetLeft;
    offsetTop += el.offsetTop;

    el = el.offsetParent;
  } while (el && el !== fromElement);

  return { offsetLeft, offsetTop };
}

export default class VisualizerOverlay {
  constructor(visualizerCanvas, windowElements) {
    this.visualizerCanvas = visualizerCanvas;

    this.wrappyCanvas = document.createElement("canvas");
    this.wrappyCtx = this.wrappyCanvas.getContext("2d");

    this.animateFns = Array.from(windowElements).map(windowEl => {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.mixBlendMode = "color-dodge";
      canvas.className = "hacky-canvas";
      windowEl.appendChild(canvas);
      return wrapMode => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var scale = windowEl.classList.contains("doubled") ? 2 : 1;
        scale *= window.devicePixelRatio || 1;
        if (
          canvas.width !== windowEl.clientWidth * scale ||
          canvas.height !== windowEl.clientHeight * scale
        ) {
          canvas.width = windowEl.clientWidth * scale;
          canvas.height = windowEl.clientHeight * scale;
        }
        canvas.style.width = windowEl.clientWidth + "px";
        canvas.style.height = windowEl.clientHeight + "px";
        var stuff = windowEl.querySelectorAll(`*`);
        Array.from(stuff)
          .reverse()
          .forEach(el => {
            const { offsetLeft, offsetTop } = getOffset(el, windowEl);
            const width = el.clientWidth;
            const height = el.clientHeight;
            if (width == 0 || height == 0) {
              return;
            }
            ctx.save();
            ctx.scale(scale, scale);
            ctx.translate(offsetLeft, offsetTop);
            if (wrapMode.stretch) {
              ctx.drawImage(this.wrappyCanvas, 0, 0, width, height);
            } else {
              ctx.drawImage(
                this.wrappyCanvas,
                0,
                0,
                width,
                height,
                0,
                0,
                width,
                height
              );
            }
            ctx.restore();
          });
      };
    });
  }

  render(wrapMode) {
    const { visualizerCanvas, wrappyCanvas, wrappyCtx, animateFns } = this;
    const { width, height } = visualizerCanvas;
    if (wrapMode.mirror) {
      wrappyCanvas.width = width * 2;
      wrappyCanvas.height = height * 2;
      wrappyCtx.save();
      wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
      wrappyCtx.translate(0, height);
      wrappyCtx.scale(1, -1);
      wrappyCtx.translate(0, -height);
      wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
      wrappyCtx.translate(width, 0);
      wrappyCtx.scale(-1, 1);
      wrappyCtx.translate(-width, 0);
      wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
      wrappyCtx.translate(0, height);
      wrappyCtx.scale(1, -1);
      wrappyCtx.translate(0, -height);
      wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
      wrappyCtx.restore();
    } else if (wrapMode.tile) {
      wrappyCanvas.width = width * 2;
      wrappyCanvas.height = height * 2;
      for (var xi = 0; xi < 2; xi++) {
        for (var xi = 0; xi < 2; xi++) {
          wrappyCtx.drawImage(
            visualizerCanvas,
            0,
            0,
            width,
            height,
            width * xi,
            height * yi,
            width,
            height
          );
        }
      }
    } else {
      wrappyCanvas.width = width;
      wrappyCanvas.height = height;
      wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
    }

    animateFns.forEach(fn => fn(wrapMode));
  }
  cleanUp() {
    Array.from(document.querySelectorAll(".hacky-canvas")).forEach(el => {
      el.remove();
    });
  }
}
