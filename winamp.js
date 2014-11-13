// UI and App logic
function Winamp () {
    self = this;
    this.media = new Media('player');
    this.skinManager = new SkinManager();
    this.font = new Font();

    this.nodes = {
        'option': document.getElementById('option'),
        'close': document.getElementById('close'),
        'shade': document.getElementById('shade'),
        'position': document.getElementById('position'),
        'fileInput': document.getElementById('file-input'),
        'volumeMessage': document.getElementById('volume-message'),
        'balanceMessage': document.getElementById('balance-message'),
        'songTitle': document.getElementById('song-title'),
        'time': document.getElementById('time'),
        'shadeTime': document.getElementById('shade-time'),
        'previous': document.getElementById('previous'),
        'play': document.getElementById('play'),
        'pause': document.getElementById('pause'),
        'stop': document.getElementById('stop'),
        'next': document.getElementById('next'),
        'eject': document.getElementById('eject'),
        'repeat': document.getElementById('repeat'),
        'shuffle': document.getElementById('shuffle'),
        'volume': document.getElementById('volume'),
        'kbps': document.getElementById('kbps'),
        'khz': document.getElementById('khz'),
        'balance': document.getElementById('balance'),
        'playPause': document.getElementById('play-pause'),
        'workIndicator': document.getElementById('work-indicator'),
        'winamp': document.getElementById('winamp'),
        'titleBar': document.getElementById('title-bar'),
    };

    // Make window dragable
    this.nodes.titleBar.addEventListener('mousedown',function(e){
        if(e.target !== this) {
            // Prevent going into drag mode when clicking any of the title
            // bar's icons by making sure the click was made directly on the
            // titlebar
            return true; }

        // Get starting window position
        var winampElm = self.nodes.winamp;

        // If the element was 'absolutely' positioned we could simply use
        // offsetLeft / offsetTop however the element is 'relatively'
        // positioned so we're using style.left. parseInt is used to remove the
        // 'px' postfix from the value
        var winStartLeft = parseInt(winampElm.style.left || 0,10),
            winStartTop  = parseInt(winampElm.style.top || 0,10);

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

            // Move window to new position
            winampElm.style.left = (winStartLeft+diffLeft)+"px";
            winampElm.style.top = (winStartTop+diffTop)+"px";
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

    this.nodes.option.onclick = function() {
        text = "Enter an Internet location to open here:\n";
        text += "For example: http://www.server.com/file.mp3"
        file = window.prompt(text, '');
        if(file != null) {
            self.startFile(file, file);
            self.media.play();
            self.setStatus('play');
        }
    }

    this.nodes.close.onclick = function() {
        self.media.stop();
        self.setStatus('stop'); // Currently unneeded
        self.nodes.winamp.classList.add('closed');
    }

    this.media.addEventListener('timeupdate', function() {
        self.nodes.position.value = self.media.percentComplete();
        self.updateTime();
    });

    this.media.addEventListener('ended', function() {
        self.setStatus('stop');
    });

    this.media.addEventListener('waiting', function() {
        self.nodes.workIndicator.classList.add('selected');
    });

    this.media.addEventListener('playing', function() {
        self.nodes.workIndicator.classList.remove('selected');
    });

    this.nodes.shade.onclick = function() {
        self.nodes.winamp.classList.toggle('shade');
    }

    this.nodes.time.onclick = function() {
        this.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.shadeTime.onclick = function() {
        self.nodes.time.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.previous.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.play.onclick = function() {
        self.media.play();
        self.setStatus('play');
    }

    this.nodes.pause.onclick = function() {
        self.media.pause();
        self.setStatus('pause');
    }

    this.nodes.stop.onclick = function() {
        self.media.stop();
        self.setStatus('stop');
    }

    this.nodes.next.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.eject.onclick = function() {
        self.nodes.fileInput.click();
    }

    this.nodes.fileInput.onchange = function(e){
        var file = e.target.files[0];
        if(file) {
            self.startFileViaReference(file);
        }
    }

    this.nodes.volume.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-volume');
    }

    this.nodes.volume.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-volume');
    }

    this.nodes.volume.oninput = function() {
        self.setVolume(this.value);
    }

    this.nodes.position.onmousedown = function() {
        self.media.pause();
    }

    this.nodes.position.onchange = function() {
        self.media.seekToPercentComplete(this.value);
    }

    this.nodes.balance.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-balance');
    }

    this.nodes.balance.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-balance');
    }

    this.nodes.balance.oninput = function() {
        self.setBalance(this.value);
    }

    this.nodes.repeat.onclick = function() {
        toggleRepeat();
    }

    this.nodes.shuffle.onclick = function() {
        toggleShuffle();
    }

    /* Functions */
    this.setStatus = function(className) {
        var statusOptions = ['play', 'stop', 'pause'];
        for(var i = 0; i < statusOptions.length; i++) {
            self.nodes.winamp.classList.remove(statusOptions[i]);
        }
        self.nodes.winamp.classList.add(className);
    }

    // From 0-100
    this.setVolume = function(volume) {
        var percent = volume / 100;
        sprite = Math.round(percent * 28);
        offset = (sprite - 1) * 15;

        self.media.setVolume(percent);
        self.nodes.volume.style.backgroundPosition = '0 -' + offset + 'px';

        string = 'Volume: ' + volume + '%';
        self.font.setNodeToString(self.nodes.volumeMessage, string);

        // This shouldn't trigger an infinite loop with volume.onchange(),
        // since the value will be the same
        self.nodes.volume.value = volume;
    }

    // From -100 to 100
    this.setBalance = function(balance) {
        var string = '';
        if(balance == 0) {
            string = 'Balance: Center';
        } else if(balance > 0) {
            string = 'Balance: ' + balance + '% Right';
        } else {
            string = 'Balance: ' + Math.abs(balance) + '% Left';
        }
        self.font.setNodeToString(self.nodes.balanceMessage, string);

        balance = Math.abs(balance) / 100
        sprite = Math.round(balance * 28);
        offset = (sprite - 1) * 15;
        self.nodes.balance.style.backgroundPosition = '-9px -' + offset + 'px';
    }

    function toggleRepeat() {
        self.media.toggleRepeat();
        self.nodes.repeat.classList.toggle('selected');
    }

    function toggleShuffle() {
        self.media.toggleShuffle();
        self.nodes.shuffle.classList.toggle('selected');
    }

    // TODO: Refactor this function
    this.updateTime = function() {
        self.updateShadePositionClass();

        var shadeMinusCharacter = ' ';
        if(this.nodes.time.classList.contains('countdown')) {
            digits = this.media.timeRemainingObject();
            var shadeMinusCharacter = '-';
        } else {
            digits = this.media.timeElapsedObject();
        }
        this.font.displayCharacterInNode(shadeMinusCharacter, document.getElementById('shade-minus-sign'));

        html = digitHtml(digits[0]);
        document.getElementById('minute-first-digit').innerHTML = '';
        document.getElementById('minute-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[0], document.getElementById('shade-minute-first-digit'));
        html = digitHtml(digits[1]);
        document.getElementById('minute-second-digit').innerHTML = '';
        document.getElementById('minute-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[1], document.getElementById('shade-minute-second-digit'));
        html = digitHtml(digits[2]);
        document.getElementById('second-first-digit').innerHTML = '';
        document.getElementById('second-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[2], document.getElementById('shade-second-first-digit'));
        html = digitHtml(digits[3]);
        document.getElementById('second-second-digit').innerHTML = '';
        document.getElementById('second-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[3], document.getElementById('shade-second-second-digit'));
    }

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    this.updateShadePositionClass = function() {
        self.nodes.position.removeAttribute("class");
        if(self.nodes.position.value <= 33) {
            self.nodes.position.classList.add('left');
        } else if(self.nodes.position.value >= 66) {
            self.nodes.position.classList.add('right');
        }
    }

    this.dragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    this.dragover = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    this.drop = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var file = dt.files[0];
        self.startFileViaReference(file);
    }

    this.nodes.winamp.addEventListener('dragenter', this.dragenter);
    this.nodes.winamp.addEventListener('dragover', this.dragover);
    this.nodes.winamp.addEventListener('drop', this.drop);

    this.startFileViaReference = function(fileReference) {
        var objectUrl = URL.createObjectURL(fileReference);
        self.startFile(objectUrl, fileReference.name);
    }

    this.startFile = function(file, fileName) {
        self.loadFile(file, fileName);
        self.media.play();
        self.setStatus('play');
    }

    this.loadFile = function(file, fileName) {
        this.media.loadFile(file);
        fileName += '  ***  '
        this.font.setNodeToString(document.getElementById('song-title'), fileName)
        this.font.setNodeToString(document.getElementById('kbps'), "128")
        this.font.setNodeToString(document.getElementById('khz'), "44")
        this.updateTime();
    }

    function digitHtml(digit) {
        horizontalOffset = digit * 9;
        div = document.createElement('div');
        div.classList.add('digit');
        div.style.backgroundPosition = '-' + horizontalOffset + 'px 0';
        div.innerHTML = digit;
        return div;
    }

    this.marqueeLoop = function() {
        setTimeout(function () {
            var text = self.nodes.songTitle.firstChild;
            // Only scroll if the text is too long
            if(text.childNodes.length > 30) {
                var characterNode = text.firstChild;
                text.removeChild(characterNode);
                text.appendChild(characterNode);
                self.marqueeLoop();
            }

        }, 220)
    }

}

keylog = [];
trigger = [78,85,76,27,76,27,83,79,70,84];
// Easter Egg
document.onkeyup = function(e){
    keylog.push(e.which);
    keylog = keylog.slice(-10);
    if(keylog.toString() == trigger.toString()) {
        document.getElementById('winamp').classList.toggle('llama');
    }
}

volume = anchorArgument('volume', 50);
balance = anchorArgument('volume', 0);
file = anchorArgument('m', 'https://mediacru.sh/download/Q2HAoRHE-JvD.mp3');
fileName = anchorArgument('name', "1. DJ Mike Llama - Llama Whippin' Intro (0:05)");
skin = anchorArgument('skin', "base-2.91");
skinUrl = anchorArgument('skin-url', false);

winamp = new Winamp();
// XXX These should be moved to a constructor, but I can't figure out how
winamp.setVolume(volume);
winamp.setBalance(balance);
winamp.loadFile(file, fileName);
winamp.marqueeLoop();
if(skinUrl) {
    winamp.skinManager.setSkinByUrl(skinUrl);
} else {
    winamp.skinManager.setSkinByName(skin);
}
