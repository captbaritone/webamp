# Maki Interpreter

This interpreter is part of our broader experiment in getting "modern" Winamp skins working in the browser. For more information about the project read the [Modern Winamp Skins Readme](../../README.md).

Maki is a compiled language, so this interpreter parses/evaluates the compiled byte code. Most of the hard work of figuring out how to write the parser has already been done as part of Ralf Engels' [Maki Decompiler](http://www.rengels.de/maki_decompiler/).

## Architecture

- [Parser](./parser.js): Given a Blob containing the binary data of a `.maki` file, returns a JSON serializeable representation of the script.
- [Runtime](../runtime/index.ts): A JavaScript object mapping class' unique ids to JavaScript implementations of those classes.
- [Interpreter](./interpreter.js): Given a parsed `.maki` file, and a command offset, exectues the `.maki` script starting at that command, and returing the value returned from executing that function.
- [Virtual Machine](./virtualMachine.js): This ties all of the above pieces together. Given a Buffer containing a `.maki` script, a Runtime, and an instance of `System`, it parses the `.maki` file, and then binds the runtime into the parsed `.maki` program. This consists of populating the `System` variable, and binding the class ids defined in the script to the actual JavaScript implementations of those classes. Finally it kicks off execution by triggering `System.onScriptLoaded()`.

## Structure of a `.maki` file

The bytecode contained in a .maki file takes the following form (I think. I'm still trying to grock it). These are my notes trying to write down what I understand so far. Most of this was infered from reading the

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
