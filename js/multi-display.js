// Single line text display that can animate and hold multiple registers
MultiDisplay = {
    node: null, // The DOM node of the display
    registers: {},
    init: function(font, node) {
        this.font = font;
        this.node = node;
        this._marqueeLoop();
        return this;
    },
    addRegister: function(key) {
        // Create element node
        var register = document.createElement("div");
        register.style.display = 'none';

        this.node.appendChild(register);
        this.registers[key] = {
            node: register,
            text: '',
            marquee: false
        };
    },
    setRegisterText: function(register, text) {
        // Set text of register
        this.font.setNodeToString(this.registers[register].node, text);
    },
    hideAllRegisters: function() {
        for(var key in this.registers) {
            this.registers[key].node.style.display = 'none';
        }
    },
    showRegister: function(key) {
        this.hideAllRegisters();
        // Show the one register
        this.registers[key].node.style.display = 'block';
    },
    startRegisterMarquee: function(key) {
        this.registers[key].marquee = true;
    },
    pauseRegisterMarquee: function(key) { 
        this.registers[key].marquee = false;
    },
    _marqueeLoop: function() {
        var self = this;
        setTimeout(function () {
            for(var key in self.registers) {
                // Check every register to see if it needs to be marqueed
                if(self.registers[key].marquee) {
                    var text = self.registers[key].node.firstChild;
                    // Only scroll if the text is too long
                    if(text && text.childNodes.length > 30) {
                        var characterNode = text.firstChild;
                        text.removeChild(characterNode);
                        text.appendChild(characterNode);
                    }
                }
            }
            self._marqueeLoop();
        }, 220);
    }
}



