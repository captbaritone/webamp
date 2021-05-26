[![gzip size](https://img.badgesize.io/https:/unpkg.com/webamp/built/webamp.lazy-bundle.min.js?label=gzip&compression=gzip)](https://bundlephobia.com/result?p=webamp)
[![Tests](https://github.com/captbaritone/webamp/workflows/CI/badge.svg)](https://github.com/captbaritone/webamp/actions?query=branch%3Amaster+workflow%3ACI)
[![Discord](https://img.shields.io/discord/434058775012311061.svg)](https://webamp.org/chat)

# Webamp

A reimplementation of Winamp 2.9 in HTML5 and JavaScript with full skin support. 
As seen on [TechCrunch], [Motherboard], [Gizmodo], Hacker News ([1], [2], [3], [4]), and [elsewhere](./packages/webamp/docs/press.md).

[![Screenshot of Webamp](https://raw.githubusercontent.com/captbaritone/webamp/master/packages/webamp/demo/images/preview.png)](https://webamp.org)

Check out this [Twitter thread](https://twitter.com/captbaritone/status/96127471401331916) for an illustrated list of features. Works in modern versions of Edge, Firefox, Safari and Chrome. IE is [not supported](http://caniuse.com/#feat=audio-api).

## Add Webamp to Your Site

Here is the **most minimal** example of adding Webamp to a page:

```HTML
<div id="app"></div>
<script src="https://unpkg.com/webamp"></script>
<script>new Webamp().renderWhenReady(app);</script>
```

For more examples, including how to add audio files, check out [`examples/` directory](./examples) and the [API documentation](./packages/webamp/docs/usage.md).

## About This Repository

Webamp uses a [monorepo](https://en.wikipedia.org/wiki/Monorepo) approach, so in addition to the Webamp NPM module, this repository contains code for a few closely related projects and some pieces of Webamp which are published as standalone modules:

* [`packages/webamp`](https://github.com/captbaritone/webamp/tree/master/packages/webamp): The [Webamp NPM module](https://www.npmjs.com/package/webamp)
* [`packages/webamp/demo`](https://github.com/captbaritone/webamp/tree/master/packages/webamp/demo): The demo site which lives at [webamp.org](https://webamp.org)
* [`packages/ani-cursor`](https://github.com/captbaritone/webamp/tree/master/packages/ani-cursor): An NPM module for rendering animiated `.ani` cursors as CSS animations
* [`packages/skin-database`](https://github.com/captbaritone/webamp/tree/master/packages/skin-database): The server component of https://skins.webamp.org which also runs our [Twitter bot](https://twitter.com/winampskins), and a Discord bot for our community chat
* [`packages/winamp-eqf`](https://github.com/captbaritone/webamp/tree/master/packages/winamp-eqf): An NPM module for parsing and constructing Winamp equalizer preset files (`.eqf`)
* [`packages/archive-org-webamp-integration-tests`](https://github.com/captbaritone/webamp/tree/master/packages/archive-org-webamp-integration-tests): An integration that confirms that archive.org's Webamp integration is working as expected
* [`packages/webamp-modern`](https://github.com/captbaritone/webamp/tree/master/packages/webamp-modern): A prototype exploring rendering "modern" Winamp skins in the browser
* [`examples`](https://github.com/captbaritone/webamp/tree/master/examples): A few examples showing how to use the NPM module

## Community

Join our community chat on Discord: <https://discord.gg/fBTDMqR>

Related communites:

- [Winamp Community Update Pack] - "New plug-ins to add additional features to Winamp as well as replacement plug-ins to provide better implementations of some of the plug-ins natively included with Winamp". ([Forum](https://getwacup.com/community/) / [Discord server](https://discord.gg/5pVTdbj))

## In the Wild

An incomplete list of websites using Webamp:

- [Internet Archive](https://blog.archive.org/2018/10/02/dont-click-on-the-llama/) - The Internet Archive lets you preview winamp skins and listen to audio tracks using Webamp
- [Winampify.io](https://winampify.io/) - An online Spotify client using Webamp
- [Webamp Desktop](https://desktop.webamp.org/) - An Electron app version of Webamp
- [98.js.org](https://98.js.org/) - A Windows 98 clone in JavaScript ([GitHub](https://github.com/1j01/98))
- [winxp.now.sh](https://winxp.now.sh/) - A Windows XP clone in JavaScript with React ([GitHub](https://github.com/ShizukuIchi))
- [Try Andy's Desk](https://desk.glitchy.website/) - A quirky Windows themed desktop experience.
- [www.dkdomino.zone](https://www.dkdomino.zone/album.html) - Someone's personal music player

## Thanks

- [Butterchurn](https://github.com/jberg/butterchurn), the amazing Mikdrop 2 WebGL implementation. Built and integrated into Webamp by: [jberg](https://github.com/jberg)
- Research and feature prototyping: @PAEz
- Beta feedback, catching many small UI inconsistencies: [LuigiHann](https://twitter.com/LuigiHann)
- Beta feedback and insider answers to obscure Winamp questions: [Darren Owen](https://twitter.com/The_DoctorO)
- Donating the `webamp` NPM module name: [Dave Eddy](http://daveeddy.com/)

Thank you to [Justin Frankel](http://www.1014.org/) and everyone at Nullsoft
for Winamp which inspired so many of us.

## License

While the Winamp name, interface, and, sample audio file are surely property of
Nullsoft, the code within this project is released under the [MIT
License](LICENSE.txt). That being said, if you do anything interesting with
this code, please let me know. I'd love to see it.

[techcrunch]: https://techcrunch.com/2018/02/09/whip-the-llamas-ass-with-this-javascript-winamp-emulator/
[motherboard]: https://motherboard.vice.com/en_us/article/qvebbv/winamp-2-mp3-music-player-emulator
[gizmodo]: https://gizmodo.com/winamp-2-has-been-immortalized-in-html5-for-your-pleasu-1655373653
[1]: https://news.ycombinator.com/item?id=8565665
[2]: https://news.ycombinator.com/item?id=15314629
[3]: https://news.ycombinator.com/item?id=16333550
[4]: https://news.ycombinator.com/item?id=17583997
[winamp community update pack]: https://getwacup.com/
