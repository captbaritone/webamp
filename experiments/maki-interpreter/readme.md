# Maki Interpreter

One possible future for Webamp would be to support "modern" skins. The biggest blocker to this is that modern skins suport a custom scripting language called Maki.

This project is an investigation into how feasible it would be to write a .maki interpreter in JavaScript. Maki is a compiled language, so this interpreter plans to parse/evaluate the compiled byte code. Most of the hard work of figuring out how to write the parser has already been done as part of Ralf Engels' [Maki Decompiler](http://www.rengels.de/maki_decompiler/). The first stage of this project is just to reimplement the parser portion of the decompiler in JavaScript.

## Roadmap

- [x] Parse top level bytecode (constants, types, variables)
- [ ] Evaluate function code
- [ ] Implement core of standard library
- [ ] ???

## Tools

- `yarn parse` Run the parser on the fixture .maki file. This is useful for `console.log` debugging.
- `yarn decompile` Run the Perl decompiler on the fixture .maki file. This is useful for sticking `print();` statements in the Perl and trying to figure out what exactly it does.
- `yarn tdd` Run the tests in "watch" mode. Great for [TDD](https://en.wikipedia.org/wiki/Test-driven_development)

## Structure

The bytecode contained in a .maki file takes the following form (I think. I'm still trying to gock it). These are my notes trying to write down what I understand so far.

1. The "magic" string "FG". This might be some kind attempt to validate that this is realy a `.maki` file?
2. A version number (which we currently ignore)
3. Some 32 bit something. We ignore this.
4. Types
   1. A 32 bit number defines how many types there are.
   2. Each type consists of four 32 bit numbers.
5. Function names
   1. A 32 bit number defines how many function names there are.
   2. Each funtion name consists of a 16 bit class code
   3. A 16 bit "dummy" (not sure what this is) and a name.
   4. The name is defined by a 16 bit number showing how long the name is, followed by that many ascii bytes.
6. Variables
   1. A 32 bit number defines how many variables there are.
   2. Each variable consists of:
   3. A byte of what "type" it is.
   4. A byte of what object it refers to.
   5. 16 bits of what subclass it refers to.
   6. Four uinits (what are those?) each 16 bits long.
   7. A byte representing "global" (what? Maybe a boolean?)
   8. A byte representing "syste" (What? Maybe a boolean?)
7. Constants
   1. A 32 bit number defines how many constants there are.
   2. Each constant consists of:
   3. A 32 bit number representing its number (is this just an ID?)
   4. The value is defined by a 16 bit number showing how long the name is, followed by that many ascii bytes.
8. Functions
   1. A 32 bit number defines how many functions there are.
   2. Each constant consists of:
   3. A 32 bit number representing its variable number (is this just an ID?)
   4. A 32 bit number representing its function number (is this just an ID?)
   5. A 32 bit number representing its offset (offset into what?)
9. Function Code
   1. A 32 bit number defines how many commands there are.
   2. Each command consists of:
   3. A byte representing that command's opcode
   4.
