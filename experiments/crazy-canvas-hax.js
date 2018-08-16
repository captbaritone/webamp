window.hax_go = () => {
  if (window.hax_cleanup) window.hax_cleanup();

  function waitFor(conditionFn, thenFn, ms) {
    setTimeout(() => {
      if (conditionFn()) {
        thenFn();
      } else {
        waitFor(conditionFn, thenFn, ms);
      }
    }, ms);
  }

  waitFor(() => document.querySelector(".gen-window canvas"), enable, 10);

  function enable() {
    var butterchurnCanvas = document.querySelector(".gen-window canvas");
    var wrappyCanvas = document.createElement("canvas");
    var wrappyCtx = wrappyCanvas.getContext("2d");
    var windows = document.querySelectorAll(".window:not(.gen-window)");

    var animate_fns = Array.from(windows).map(window_el => {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.mixBlendMode = "color-dodge";
      canvas.className = "hacky-canvas";
      window_el.appendChild(canvas);
      return () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (
          canvas.width !== window_el.clientWidth ||
          canvas.height !== window_el.clientHeight
        ) {
          canvas.width = window_el.clientWidth;
          canvas.height = window_el.clientHeight;
        }
        const window_el_rect = window_el.getBoundingClientRect();
        var stuff = window_el.querySelectorAll(`*`);
        Array.from(stuff)
          .reverse()
          .forEach(el => {
            const rect = el.getBoundingClientRect();
            const x = rect.left - window_el_rect.left;
            const y = rect.top - window_el_rect.top;
            const width = rect.right - rect.left;
            const height = rect.bottom - rect.top;
            if (width == 0 || height == 0) {
              return;
            }
            ctx.save();
            ctx.translate(x, y);
            ctx.drawImage(wrappyCanvas, 0, 0, width, height);
            ctx.restore();
          });
      };
    });

    var rafID;
    function animate() {
      rafID = requestAnimationFrame(animate);
      const { width, height } = butterchurnCanvas;
      wrappyCanvas.width = width * 2;
      wrappyCanvas.height = height * 2;
      // wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height, 0, 0, width, height);
      // wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height, width, 0, width, height);
      // wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height, 0, height, width, height);
      // wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height, width, height, width, height);
      wrappyCtx.save();
      wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height);
      wrappyCtx.translate(0, height);
      wrappyCtx.scale(1, -1);
      wrappyCtx.translate(0, -height);
      wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height);
      wrappyCtx.translate(width, 0);
      wrappyCtx.scale(-1, 1);
      wrappyCtx.translate(-width, 0);
      wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height);
      wrappyCtx.translate(0, height);
      wrappyCtx.scale(1, -1);
      wrappyCtx.translate(0, -height);
      wrappyCtx.drawImage(butterchurnCanvas, 0, 0, width, height);
      wrappyCtx.restore();

      animate_fns.forEach(fn => fn());
    }
    window.hax_cleanup = () => {
      Array.from(document.querySelectorAll(".hacky-canvas")).forEach(el => {
        el.remove();
      });
      cancelAnimationFrame(rafID);
      rafID = null;
    };
    animate();
  }
};
