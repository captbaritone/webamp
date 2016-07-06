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
    el('div', {id: 'option'}, [
      el('ul', {id: 'context-menu'}, [
        el('li', {}, [
          el('a', {href: 'https://github.com/captbaritone/winamp2-js', target: '_blank'}, 'Winamp2-js...')
        ]),
        el('li', {class: 'hr'}, [ el('hr') ]),
        el('li', {id: 'context-play-file'}, 'Play File...'),
        el('li', {class: 'parent'}, [
          el('ul', {}, [
            el('li', {id: 'context-load-skin'}, 'Load Skin...'),
            el('li', {class: 'hr'}, [ el('hr') ]),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz'}, '<Base Skin>'),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/MacOSXAqua1-5.wsz'}, 'Mac OSX v1.5 (Aqua)'),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/TopazAmp1-2.wsz'}, 'TopazAmp'),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/Vizor1-01.wsz'}, 'Vizor'),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/XMMS-Turquoise.wsz'}, 'XMMS Turquoise '),
            el('li', {'class': 'skin-select', 'data-skin-url': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/ZaxonRemake1-0.wsz'}, 'Zaxon Remake')
            // More here
          ]),
          'Skins'
        ]),
        el('li', {class: 'hr'}, [ el('hr') ]),
        el('li', {id: 'context-exit'}, 'Exit')
      ])
    ]),
    el('div', {id: 'shade-time'}, [
      el('div', {id: 'shade-minus-sign'}),
      el('div', {id: 'shade-minute-first-digit', class: 'character'}),
      el('div', {id: 'shade-minute-second-digit', class: 'character'}),
      el('div', {id: 'shade-second-first-digit', class: 'character'}),
      el('div', {id: 'shade-second-second-digit', class: 'character'})
    ]),
    el('div', {id: 'minimize'}),
    el('div', {id: 'shade'}),
    el('div', {id: 'close'})
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
    el('div', {id: 'time'}, [
      el('div', {id: 'minus-sign'}),
      el('div', {id: 'minute-first-digit'}),
      el('div', {id: 'minute-second-digit'}),
      el('div', {id: 'second-first-digit'}),
      el('div', {id: 'second-second-digit'})
    ]),
    el('canvas', {id: 'visualizer', width: '152', height: '32'})
  ]),
  el('div', {class: 'media-info'}, [
    el('div', {id: 'song-title', class: 'text'}),
    el('div', {id: 'kbps'}),
    el('div', {id: 'khz'}),
    el('div', {class: 'mono-stereo'}, [
      el('div', {id: 'mono'}),
      el('div', {id: 'stereo'})
    ])
  ]),
  el('input', {id: 'volume', type: 'range', min: '0', max: '100', step: '1', value: '50'}),
  el('input', {id: 'balance', type: 'range', min: '-100', max: '100', step: '2', value: '0'}),
  el('div', {class: 'windows'}, [
    el('div', {id: 'equalizer-button'}),
    el('div', {id: 'playlist-button'})
  ]),
  el('input', {id: 'position', type: 'range', min: '0', max: '100', step: '1', value: '0'}),
  el('div', {class: 'actions'}, [
    el('div', {id: 'previous'}),
    el('div', {id: 'play'}),
    el('div', {id: 'pause'}),
    el('div', {id: 'stop'}),
    el('div', {id: 'next'})
  ]),
  el('div', {id: 'eject'}),
  el('div', {class: 'shuffle-repeat'}, [
    el('div', {id: 'shuffle'}),
    el('div', {id: 'repeat'})
  ]),
  el('a', {id: 'about', target: 'blank', href: 'https://github.com/captbaritone/winamp2-js'})
]);
