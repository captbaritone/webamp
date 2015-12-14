// Single line text display that can animate and hold multiple registers
define(['font'], function(Font) {
  var MultiDisplay = function(node) {
    this.font = new Font();
    this.node = node;
    this.registers = {};
    this._marqueeLoop();
  };

  MultiDisplay.prototype.addRegister = function(key) {
    // Create element node
    var register = document.createElement('div');
    register.style.display = 'none';

    this.node.appendChild(register);
    this.registers[key] = {
      node: register,
      text: '',
      marquee: false
    };
  };

  // Set text of register
  MultiDisplay.prototype.setRegisterText = function(register, text) {
    this.font.setNodeToString(this.registers[register].node, text);
  };

  MultiDisplay.prototype.showRegister = function(showKey) {
    for (var key in this.registers) {
      var display = (key === showKey) ? 'block' : 'none';
      this.registers[key].node.style.display = display;
    }
  };

  MultiDisplay.prototype.startRegisterMarquee = function(key) {
    this.registers[key].marquee = true;
  };

  MultiDisplay.prototype.pauseRegisterMarquee = function(key) {
    this.registers[key].marquee = false;
  };

  MultiDisplay.prototype._marqueeLoop = function() {
    var self = this;
    setTimeout(function() {
      for (var key in self.registers) {
        // Check every register to see if it needs to be marqueed
        if (self.registers[key].marquee) {
          var text = self.registers[key].node.firstChild;
          // Only scroll if the text is too long
          if (text && text.childNodes.length > 30) {
            var characterNode = text.firstChild;
            text.removeChild(characterNode);
            text.appendChild(characterNode);
          }
        }
      }
      self._marqueeLoop();
    }, 220);
  };

  return MultiDisplay;
});
