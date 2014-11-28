/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    init: function(canvasNode, analyser) {
        this.canvas = canvasNode;
        this.analyser = analyser;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasCtx.imageSmoothingEnabled= false;
        this.canvasCtx.translate(1, 1); //  http://stackoverflow.com/questions/13593527/canvas-make-the-line-thicker
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.colors = []; // skin.js fills this from viscolors.txt
        this.NONE = 0;
        this.OSCILLOSCOPE = 1;
        this.BAR = 2;
        this.bufferLength = null;
        this.dataArray = null;
        this.setStyle(this.BAR);

        return this;
    },

    clear: function() {
        // +/- is just there to deal with offset, meh if its right or not ;)
        this.canvasCtx.clearRect(-2, -2, this.width + 2, this.height + 2);
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
        function avg(dataArray) {
            var avg = 0;
            var count = 0;
            for (var l = lastIndex; l < index + 1; l++) {
                avg += dataArray[l];
                count++;
            }
            var v = avg / count;
            return h * v / 128;
        }
        this.analyser.getByteTimeDomainData(this.dataArray);

        this.canvasCtx.lineWidth = 2; // 2 because were shrinking the canvas by 2

        // Just use one of the viscolors for now
        this.canvasCtx.strokeStyle = this.colors[18];

        this.canvasCtx.beginPath();

        var sliceWidth = this.bufferLength / this.width * 1;
        var h = this.height / 2;

        this.canvasCtx.moveTo(-2, h);
        var index = 0;
        var lastIndex = 0;
        for (var i = 0, iEnd = this.width * 1; i < iEnd; i += 2) {
            index = i * sliceWidth | 0;
            this.canvasCtx.lineTo(i, avg(this.dataArray));
            lastIndex = index + 1;
        }
        lastIndex = index + 1;
            index = i * sliceWidth | 0;

        this.canvasCtx.lineTo(this.width, avg(this.dataArray));
        this.canvasCtx.stroke();
    },

    _paintBarFrame: function() {
        var printBar = function(x, height) {
            var max = height;
            for(i = 0; i <= max; i++) {
                var colorNumber = 17 - i;
                var y = 32 - (i*2);
                this.canvasCtx.fillStyle = this.colors[colorNumber];
                this.canvasCtx.fillRect(x,y,6,2);
            }

            // Draw the grey peak line
            this.canvasCtx.fillStyle = this.colors[23];
            var y = 32 - ((max)*2);
            this.canvasCtx.fillRect(x,y,6,2);
        }.bind(this);

        this.analyser.getByteFrequencyData(this.dataArray);
        for(j = 0; j < this.bufferLength; j++) {
            height = this.dataArray[j] * (15/256);
            printBar(j*8, height);
        }
    }
}
