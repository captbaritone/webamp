# Modern Winamp Skins

This package is an experiment to see if we can bring "modern" Winamp skins to the browser. It's still very early. If you have any qeustions or are interested in getting involved, feel free to check out our [Discord server](https://discord.gg/mEcRbVq).

- We have a master task here which is sometimes up to date: https://github.com/captbaritone/webamp/issues/796
- We have a shared Dropbox Paper doc with contains a grab bag of notes, but it will likely be hard to newcomers to read. You can find it [here](https://paper.dropbox.com/doc/Webamp-Modern-Skins-Notes--AgWp4Jwdobq13VLYYOgwJGOCAQ-UpeDNptmJ0t6aN1jlWbfU).
- We have a document with [meeting notes](https://paper.dropbox.com/doc/Meeting-Notes-lPgIliU4ZThefBT3J8g2a) from the few in-person meetings that Jordan Eldredge and Jordan Berg have had to discuss the project.

## Maki Interpreter

One of the biggest challenges to this project is that modern skins could define their own behavior by writing scripts in a custom language called Maki (Make a Killer Interface). One of the critical pieces of this project will be to write a working Maki interpreter and runtime in browser-compatible JavaScript. We have made good progress on this front. The work on that project lives in `src/maki-interpreter` and has its own [readme](./src/maki-interpreter/readme.md).

One goal of this project is to document what we learn about the Maki language so that if others wish to travel down this path they will have an open source reference implementation and also better docs than we had. We've started that effort with out [Maki Language Spec](https://paper.dropbox.com/doc/Maki-Language-Spec--AlIjyyR70bQuNFJD7rIeuFfiAg-csainvAwSr3SBUXO5DWXy) document. Once the document stabalizes, we will likely convert it to Markdown and check it into this repository.

Another way to document the behavior of Maki is to write automated tests in the form of Maki scripts. We have few of these so far, but intend to be more systematic about writing tests in the future. For now our tests can be found in `resources/maki_compiler/*/*.maki` and `src/maki-interpreter/fixtures/issue_*/*.maki`.

## Standard Library

In addition to the Maki interpreter, we also need an implementation of the Maki standard library. We have some portion of that implmented, but it's still very much a work in progress. You can find the code in `src/runtime/`. The definition for how these classes and methods should behave is derived from looking at the types defined in the `std.mi` file distributed with the Maki compiler. We have a file that contains a JSON representation of these types. It can be found in `src/objects.js`. That file is used for a few runtime checks (which I hope we can remove) but also to power some static analysis and tests.

`src/objects.test.js` does some tests to double check that every method no prefixed with `_` or `js_` is a maki method. It also tracks which methods are still unimplemented in a Jest snapshot file.

`eslint-local-rules.js` contains a custom [ESLint](https://eslint.org/) rule which uses the type definitions to check many of the same things that the Jest test checks, but also can make assertions about argument names and TypeScript types. This approach also has the advantage that it can automatically correct some errors and generate stubs for missing methods.

We also have a tool for examining a corpus of modern skins an extracting which methods of the standard libary they use. This lives in `src/maki-interpreter/tools/extract-functions.js` it's not really built for anyone but Jordan to run, so it has a few paths hard coded into it. This could be fixed if somebody else had the interest. By running `yarn analyze-wals` it will look in a specific hard-coded folder for skins and extract method data from them. It will then write that data to `resources/maki-skin-data.json`. This data is invaluable for prioritizing which methods we should implement next. Some methods are only used by a very small number of skins. Others are not used at all.

The data extracted by the `extract-functions.js` utility and the list of unimplmented methods which is validated by `src/objects.test.js` can be visualized visiting [https://webamp.org/ready/](https://webamp.org/ready/) or `localhost:8080/ready` if developing locally. This dashboard makes it very easy to see current progress and explore the usage of different methods. Keep in mind that as of this writting some ~20% of `.maki` files fail to parse, so the data on this page represents a lower bound of actual usage.

## Architecture

How we tie together our standard library implementation, the interpreter and the DOM (React) is still not a solved problem. We have stuff working, but we are not sure it's the right approach. We are currently doing work to move toward what we are calling [Mutable XML Tree](https://paper.dropbox.com/doc/A-Third-Way-Mutable-XML-Tree-vx3iPfGIBmSHEDJSMh0bn) architecture but, to be honest, we are not 100% this will actually work.

## Running

This experiment is now built as part of the main Webamp project. To run it locally you just need to do the following from the repositories root directory:

```
yarn
yarn start
```

Then open: `http://localhost:8080/`.

## Tests

This experiments tests are run as part of the main Webamp test suite. To run all tests just run: `yart test`.
