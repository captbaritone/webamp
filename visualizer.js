/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    init: function(canvasNode) {
        this.canvas = canvasNode;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasCtx.imageSmoothingEnabled= false;
        this.canvasCtx.translate(1, 1); //  http://stackoverflow.com/questions/13593527/canvas-make-the-line-thicker
        this.width = this.canvas.width * 1; // Cast to int
        this.height = this.canvas.height * 1; // Cast to int
        this.pixel = this.canvasCtx.createImageData(2,2);

        // Constants
        this.NONE = 0;
        this.OSCILLOSCOPE = 1;
        this.BAR = 2;
        return this;
    },

    clear: function() {
        // +/- is just there to deal with offset, meh if its right or not ;)
        this.canvasCtx.clearRect(-1, -1, this.width + 2, this.height + 2);
    },

    paintFrame: function(type, bufferLength, dataArray) {
        this.clear();
        if(type == this.OSCILLOSCOPE) {
            return this._paintOscilloscopeFrame(bufferLength, dataArray);
        } else if(type == this.BAR) {
            return this._paintBarFrame(bufferLength, dataArray);
        }
    },

    _paintOscilloscopeFrame: function(bufferLength, dataArray) {
        function avg() {
            var avg = 0;
            var count = 0;
            for (var l = lastIndex; l < index + 1; l++) {
                avg += dataArray[l];
                count++;
            }
            var v = avg / count;
            return h * v / 128;
        }

        var color = [255,255,255,255];

        var sliceWidth = bufferLength / this.width;
        var h = this.height / 2;

        var y = 0;
        var index = 0;
        var lastIndex = 0;
        for (var i = 0, iEnd = this.width * 1; i < iEnd; i += 2) {
            index = i * sliceWidth | 0;

            // Only plot to even pixels, since we are scaling. Otherwise we get
            // more precision than we should have
            y = 2 * Math.round(avg() / 2);
            this.canvasCtx.putImageData(this._pixel(color), i, y);
            lastIndex = index + 1;
        }
    },

    _paintBarFrame: function(bufferLength, dataArray) {
        // TODO
    },

    // Get an imagedata blob representing a pixel in the given color
    // Actualy a 2x2 square due to our scaling
    _pixel: function(rgba) {
        for(i = 0; i < 4; i++) {
            j = i * 4;
            this.pixel.data[j+0] = rgba[0]; // Red
            this.pixel.data[j+1] = rgba[1]; // Green
            this.pixel.data[j+2] = rgba[2]; // Blue
            this.pixel.data[j+3] = rgba[3]; // Alpha
        }
        return this.pixel;
    }
}
