# Modern Winamp Skins

This package is part of an experiment to see if we could bring "modern" Winamp skins to the browser. It's still very early. If you have any qeustions or are interested in getting involved, feel free to check out our [Discord server](https://discord.gg/mEcRbVq).

- We have a master task here which is sometimes up to date: https://github.com/captbaritone/webamp/issues/796
- We have a shared Dropbox Paper doc with up to date notes, but it will likely be hard to newcomers to read. You can find it [here](https://paper.dropbox.com/doc/Webamp-Modern-Skins-Notes--AgWp4Jwdobq13VLYYOgwJGOCAQ-UpeDNptmJ0t6aN1jlWbfU).

## Maki Interpreter

One of the biggest challenges to this project is that modern skins could define their own behavior by writing scripts in a custom language called Maki (Make a Killer Interface). One of the critical pieces of this project will be to write a working Maki interpreter and runtime in browser-compatible JavaScript. We have made good progress on this front. The work on that project lives in `src/maki-interpreter` and has its own [readme](./src/maki-interpreter/readme.md).

## Running

This project is _very_ incomplete. Still, you can see some of what we have working so far by starting a dev server. The project was boot strapped with [Create React App](https://facebook.github.io/create-react-app/) so you can get it running with:

```
yarn
yarn start
```

## Tests

Some things have tests. You can run them by running `yarn test` in this directory. Note that they do not currently run as part of his repostiorie`s Travis tests.
