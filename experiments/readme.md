# Maki Interpreter

One possible future for Webamp would be to support "modern" skins. The biggest blocker to this is that modern skins suport a custom scripting language called Maki.

This project is an investigation into how feasible it would be to write a .maki interpreter in JavaScript. Maki is a compiled language, so this interpreter plans to parse/evaluate the compiled byte code. Most of the hard work of figuring out how to write the parser has already been done as part of Ralf Engels' [Maki Decompiler](http://www.rengels.de/maki_decompiler/). The first stage of this project is just to reimplement the parser portion of the decompiler in JavaScript.

## Roadmap

- [x] Parse top level bytecode (constants, types, variables)
- [ ] Evaluate function code
- [ ] Implement core of standard library
- [ ] ???
