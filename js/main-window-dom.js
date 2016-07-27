function el(tagName, attributes, content) {
  tagName = tagName || 'div';
  attributes = attributes || {};
  content = content || [];
  var tag = document.createElement(tagName);
  if (typeof content === 'string') {
    content = [content];
  }
  for (var attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      tag.setAttribute(attr, attributes[attr]);
    }
  }
  for (var i = 0; i < content.length; i++) {
    if (typeof content[i] === 'string') {
      tag.appendChild(document.createTextNode(content[i]));
    } else {
      tag.appendChild(content[i]);
    }
  }
  return tag;
}

module.exports = el('div', {id: 'main-window', class: 'loading stop'}, [
  el('div', {id: 'loading'}, 'Loading...'),
  el('div', {id: 'title-bar', class: 'selected'}, [
    el('div', {id: 'context-menu-holder'}),
    el('div', {id: 'shade-time-holder'}),
    el('div', {id: 'minimize'}),
    el('div', {id: 'shade'}),
    el('div', {id: 'close-holder'})
  ]),
  el('div', {class: 'status'}, [
    el('div', {id: 'clutter-bar'}, [
      el('div', {id: 'button-o'}),
      el('div', {id: 'button-a'}),
      el('div', {id: 'button-i'}),
      el('div', {id: 'button-d'}),
      el('div', {id: 'button-v'})
    ]),
    el('div', {id: 'play-pause'}),
    el('div', {id: 'work-indicator'}),
    el('div', {id: 'time-holder'}),
    el('canvas', {id: 'visualizer', width: '152', height: '32'})
  ]),
  el('div', {class: 'media-info'}, [
    el('div', {id: 'song-title', class: 'text'}),
    el('div', {id: 'kbps-holder'}),
    el('div', {id: 'khz-holder'}),
    el('div', {id: 'mono-stereo-holder'})
  ]),
  el('div', {id: 'volume-holder'}),
  el('div', {id: 'balance-holder'}),
  el('div', {class: 'windows'}, [
    el('div', {id: 'equalizer-button'}),
    el('div', {id: 'playlist-button'})
  ]),
  el('div', {id: 'position-holder'}),
  el('div', {id: 'actions-holder'}),
  el('div', {id: 'eject-holder'}),
  el('div', {class: 'shuffle-repeat'}, [
    el('div', {id: 'shuffle-holder'}),
    el('div', {id: 'repeat-holder'})
  ]),
  el('a', {id: 'about', target: 'blank', href: 'https://github.com/captbaritone/winamp2-js'})
]);
