module.exports = {
  registerWindow: function(win) {
    var body = win.body;
    var handle = win.handle;

    // Make window dragable
    handle.addEventListener('mousedown', function(e){
      if (e.target !== this) {
        // Prevent going into drag mode when clicking any of the title
        // bar's icons by making sure the click was made directly on the
        // titlebar
        return true;
      }

      // If the element was 'absolutely' positioned we could simply use
      // offsetLeft / offsetTop however the element is 'relatively'
      // positioned so we're using style.left. parseInt is used to remove the
      // 'px' postfix from the value
      var winStartLeft = parseInt(body.offsetLeft || 0, 10),
        winStartTop = parseInt(body.offsetTop || 0, 10);

      // Get starting mouse position
      var mouseStartLeft = e.clientX,
        mouseStartTop = e.clientY;

      // Mouse move handler function while mouse is down
      function handleMove(moveEvent) {
        // Get current mouse position
        var mouseLeft = moveEvent.clientX,
          mouseTop = moveEvent.clientY;

        // Calculate difference offsets
        var diffLeft = mouseLeft - mouseStartLeft,
          diffTop = mouseTop - mouseStartTop;

        // These margins were only useful for centering the div, now we
        // don't need them
        body.style.marginLeft = '0px';
        body.style.marginTop = '0px';
        // Move window to new position
        body.style.left = (winStartLeft + diffLeft) + 'px';
        body.style.top = (winStartTop + diffTop) + 'px';
      }

      // Mouse button up
      function handleUp() {
        removeListeners();
      }

      function removeListeners() {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      }

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    });
  }
};
