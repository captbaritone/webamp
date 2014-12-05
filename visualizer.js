/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    init: function(canvasNode, analyser) {
        this.canvas = canvasNode;
        this.analyser = analyser;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasCtx.imageSmoothingEnabled= false;
        this.width = this.canvas.width * 1; // Cast to int
        this.height = this.canvas.height * 1; // Cast to int
        this.colors = []; // skin.js fills this from viscolors.txt
        this.NONE = 0;
        this.OSCILLOSCOPE = 1;
        this.BAR = 2;
        this.bufferLength = null;
        this.dataArray = null;
        this.setStyle(this.BAR);

        // Off-screen canvas for pre-rendering the background
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.bgCanvasCtx = this.bgCanvas.getContext("2d");

        // Off-screen canvas for pre-rendering a single bar gradient
        this.barCanvas = document.createElement('canvas');
        this.barCanvas.width = 6;
        this.barCanvas.height = 32;
        this.barCanvasCtx = this.barCanvas.getContext("2d");
        return this;
    },

    clear: function() {
        this.canvasCtx.drawImage(this.bgCanvas, 0, 0);
    },

    setColors: function(colors) {
        this.colors = colors;
        this.preRenderBg();
        this.preRenderBar();
    },

    // Pre-render the background grid
    preRenderBg: function() {
        this.bgCanvasCtx.fillStyle = this.colors[0];
        this.bgCanvasCtx.fillRect(0,0,this.width, this.height);
        this.bgCanvasCtx.fillStyle = this.colors[1];
        for(x = 0; x < this.width; x += 4) {
            for(y = 0; y < this.height; y += 4) {
                this.bgCanvasCtx.fillRect(x,y,2,2);
            }
        }
    },

    // Pre-render the bar gradient
    preRenderBar: function() {
        this.barCanvasCtx.fillStyle = this.colors[23];
        this.barCanvasCtx.fillRect(0,0,6,2);
        for(i = 0; i <= 15; i++) {
            var colorNumber = 17 - i;
            this.barCanvasCtx.fillStyle = this.colors[colorNumber];
            var y = 32 - (i*2);
            this.barCanvasCtx.fillRect(0,y,6,2);
        }
        // If we are paused when the skin changes, we will keep the vis colors
        // until we paint again. For now we can just clear the current frame so
        // we don't end up with a clashing visual.
        this.clear();
    },

    setStyle: function(style) {
        this.style = style;
        if(this.style == this.OSCILLOSCOPE) {
            this.analyser.fftSize = 2048;
            this.bufferLength = this.analyser.fftSize;
            this.dataArray = new Uint8Array(this.bufferLength);
        } else if(this.style == this.BAR) {
            this.analyser.fftSize = 64; // Must be a power of two
            // Number of bins/bars we get
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
        }
    },

    paintFrame: function() {
        this.clear();
        if(this.style == this.OSCILLOSCOPE) {
            return this._paintOscilloscopeFrame();
        } else if(this.style == this.BAR) {
            return this._paintBarFrame();
        }
    },

    _paintOscilloscopeFrame: function() {
        // Return the average value in a slice of dataArray
        function sliceAverage(dataArray, sliceWidth, sliceNumber) {
            var start = sliceWidth * sliceNumber;
            var end = start + sliceWidth;
            var sum = 0;
            for(var i = start; i < end; i++) {
                sum += dataArray[i];
            }
            return sum / sliceWidth;
        }

        this.analyser.getByteTimeDomainData(this.dataArray);

        // 2 because we're shrinking the canvas by 2
        this.canvasCtx.lineWidth = 2;

        // Just use one of the viscolors for now
        this.canvasCtx.strokeStyle = this.colors[18];

        // Since dataArray has more values than we have pixels to display, we
        // have to average several dataArray values per pixel. We call these
        // groups slices.
        //
        // We use the  2x scale here since we only want to plot values for
        // "real" pixels.
        var sliceWidth = Math.floor(this.bufferLength / this.width) * 2;

        // The max amplitude is half the height
        var h = this.height / 2;

        this.canvasCtx.beginPath();

        // Iterate over the width of the canvas in "real" pixels.
        for (var j = 0; j <= this.width/2; j++) {
            amplitude = sliceAverage(this.dataArray, sliceWidth, j);
            percentAmplitude = amplitude / 128; // dataArray gives us bytes
            y = percentAmplitude * h;
            x = j * 2;

            // Canvas coordinates are in the middle of the pixel by default.
            // When we want to draw pixel perfect lines, we will need to
            // account for that here
            if(x == 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
        }
        this.canvasCtx.stroke();
    },

    _paintBarFrame: function() {
        var printBar = function(x, height) {
            height = Math.round(height) * 2;
            if(height > 0) {
                y = 30 - height;
                // Draw the gray peak line
                this.canvasCtx.drawImage(this.barCanvas, 0, 0, 6, 2, x, y - 2, 6, 2);
                // Draw the gradient
                this.canvasCtx.drawImage(this.barCanvas, 0, y, 6, height, x, y, 6, height);
            }
        }.bind(this);

        this.analyser.getByteFrequencyData(this.dataArray);
        for(j = 0; j < this.bufferLength; j++) {
            height = this.dataArray[j] * (15/256);
            printBar(j*8, height);
        }
    }
}
