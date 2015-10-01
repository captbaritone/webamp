define(['../../js/media'], function(Media){
    describe("The Media class", function(){
        var media = new Media();
        media.loadUrl('https://rawgit.com/captbaritone/llama/master/llama-2.91.mp3?v=3');
        describe("has a volume", function() {
            it("that starts at 1", function(){
                expect(media.getVolume()).toEqual(1);
            });
            it("that can be set", function(){
                var intended = 0.75;
                media.setVolume(intended);
                expect(media.getVolume()).toEqual(intended);
            });
        });
        describe("has a balance control", function() {
            it("that starts at center", function(){
                expect(media.getBalance()).toEqual(0);
            });
            it("that can be set right", function(){
                var intended = 75;
                media.setBalance(intended);
                expect(media.getBalance()).toEqual(intended);
            });
            it("that can be set left", function(){
                var intended = -75;
                media.setBalance(intended);
                expect(media.getBalance()).toEqual(intended);
            });
        });
        describe("triggers", function(){
            it("the 'loadedmeta' data event", function(done) {
                var media = new Media();
                media.addEventListener('loadedmetadata', function() {
                    expect(media.audio.readyState).toBeGreaterThan(media.audio.HAVE_METADATA - 1);
                    done();
                });
                media.loadUrl('https://rawgit.com/captbaritone/llama/master/llama-2.91.mp3');
            });
            it("the 'canplay' event", function(done) {
                var media = new Media();
                media.addEventListener('canplay', function() {
                    expect(media.audio.readyState).toBeGreaterThan(media.audio.HAVE_FUTURE_DATA - 1);
                    done();
                });
                media.loadUrl('https://rawgit.com/captbaritone/llama/master/llama-2.91.mp3');
            });
        });
        describe("after loading an audio file", function(){
            it("knows the number of audio channels", function(){
                expect(media.channels()).toEqual(2);
            });
            it("has zero percent progress", function(){
                expect(media.percentComplete()).toEqual(0);
            });
            it("has zero time elapsed", function(){
                expect(media.timeElapsed()).toEqual(0);
            });
            it("knows the media files duration", function(){
                expect(Math.round(media.duration())).toEqual(5);
            });
            it("knows the time remaining", function(){
                expect(Math.round(media.timeRemaining())).toEqual(5);
            });
            it("can seek to the 3/4 way point", function(done){
                var media = new Media();
                var intended = 75;
                var first = true; // Prevent infinite loop
                media.addEventListener('canplaythrough', function() {
                    if(first) {
                        media.seekToPercentComplete(intended);
                        expect(Math.round(media.percentComplete())).toEqual(intended);
                        first = false;
                        done();
                    }
                });
                media.loadUrl('https://rawgit.com/captbaritone/llama/master/llama-2.91.mp3');

            });
            it("can seek to one second in", function(){
                media.seekToTime(1);
                expect(media.timeElapsed()).toEqual(1);
            });
            it("can detect the audio file's sample rate", function(){
                expect(media.sampleRate()).toEqual(44100);
            });
            it("is paused", function(){
                expect(media.paused()).toEqual(true);
            });
        });
        describe("after loading a mono audio file", function(){
            var media = new Media();
            media.loadUrl('http://www.mediacollege.com/audio/tone/files/440Hz_44100Hz_16bit_30sec.mp3?v=1');
            // http://stackoverflow.com/questions/32835149/how-can-i-detect-the-number-of-audio-channels-in-an-mp3-in-an-audio-tag
            xit("knows the number of audio channels", function(){
                expect(media.channels()).toEqual(1);
            });
            it("can detect the audio file's sample rate", function(){
                expect(media.sampleRate()).toEqual(44100);
            });
        });
    });
});
