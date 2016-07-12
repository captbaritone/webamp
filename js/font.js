// Manage rendering text from this skin's text.bmp file
module.exports = function() {

  // Fill a node with a <div> containing character <div>s
  this.setNodeToString = function(node, string) {
    var stringElement = document.createElement('div');
    for (var i = 0, len = string.length; i < len; i++) {
      var char = string[i].toLowerCase();
      stringElement.appendChild(this.characterNode(char));
    }
    node.innerHTML = '';
    node.appendChild(stringElement);
  };

  // Get a <div> containing char
  this.characterNode = function(char) {
    return this.displayCharacterInNode(char, document.createElement('div'));
  };

  // Style/populate a <div> to display a character
  this.displayCharacterInNode = function(character, node) {
    character = character.toString();
    var className = 'character-' + character.charCodeAt(0);
    node.classList.add('character');
    node.classList.add(className);
    return node;
  };
};
