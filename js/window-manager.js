WindowManager = {
    windows: {},
    registerWindow: function(name, win) {
        var self = this;
        var body = win.body;
        var handle = win.handle;
        var resizeHandle = win.resizeHandle;

        this.windows[name] = body;

        body.addEventListener('mousedown',function(e){
            for (var name in self.windows) {
                self.windows[name].classList.remove('selected');
            }
            this.classList.add('selected');
        });

        // Make window dragable
        handle.addEventListener('mousedown',function(e){
            if(e.target.classList.contains('ui')) {
                // Prevent going into drag mode when clicking any of the title
                // bar's icons by making sure the click was made directly on the
                // titlebar
                return true; }

            // If the element was 'absolutely' positioned we could simply use
            // offsetLeft / offsetTop however the element is 'relatively'
            // positioned so we're using style.left. parseInt is used to remove the
            // 'px' postfix from the value
            var winStartLeft = parseInt(body.offsetLeft || 0,10),
                winStartTop  = parseInt(body.offsetTop || 0,10);

            // Get starting mouse position
            var mouseStartLeft = e.clientX,
                mouseStartTop = e.clientY;

            // Mouse move handler function while mouse is down
            function handleMove(e) {
                // Get current mouse position
                var mouseLeft = e.clientX,
                    mouseTop = e.clientY;

                // Calculate difference offsets
                var diffLeft = mouseLeft-mouseStartLeft,
                    diffTop = mouseTop-mouseStartTop;

                // These margins were only useful for centering the div, now we
                // don't need them
                body.style.marginLeft = "0px";
                body.style.marginTop = "0px";
                // Move window to new position
                body.style.left = (winStartLeft+diffLeft)+"px";
                body.style.top = (winStartTop+diffTop)+"px";
            }

            // Mouse button up
            function handleUp() {
                removeListeners();
            }

            function removeListeners() {
                window.removeEventListener('mousemove',handleMove);
                window.removeEventListener('mouseup',handleUp);
            }

            window.addEventListener('mousemove',handleMove);
            window.addEventListener('mouseup',handleUp);
        });

        if (typeof resizeHandle == 'undefined') return;

        // Make window resizeable
        resizeHandle.addEventListener('mousedown',function(e){
            var winStartHeight = body.offsetHeight,
                winStartWidth  = body.offsetWidth;

            // Get starting mouse position
            var mouseStartLeft = e.clientX,
                mouseStartTop = e.clientY;

            // Mouse move handler function while mouse is down
            function handleResize(e) {
                // Get current mouse position
                var mouseLeft = e.clientX,
                    mouseTop = e.clientY;

                // Calculate difference offsets
                var diffLeft = mouseLeft-mouseStartLeft,
                    diffTop = mouseTop-mouseStartTop;

                var newWidth = (winStartWidth+diffLeft),
                    newHeight = (winStartHeight+diffTop);

                // Enforce resizing by 25px
                newWidth = Math.ceil(newWidth / 25.0) * 25;
                newHeight = Math.ceil(newHeight / 29.0) * 29;

                // Enforce minimum size
                newWidth = Math.max(newWidth, 275);
                newHeight = Math.max(newHeight, 116);

                // Resize window
                body.style.width = newWidth +"px";
                body.style.height = newHeight +"px";
            }

            // Mouse button up
            function handleUp() {
                removeListeners();
            }

            function removeListeners() {
                window.removeEventListener('mousemove',handleResize);
                window.removeEventListener('mouseup',handleUp);
            }

            window.addEventListener('mousemove',handleResize);
            window.addEventListener('mouseup',handleUp);
        });
    }
};
