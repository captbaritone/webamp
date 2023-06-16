# Maki Interpreter

This interpreter is part of our broader experiment in getting "modern" Winamp skins working in the browser. For more information about the project read the [Modern Winamp Skins Readme](../../README.md).

## Architecture

- [Parser](./parser.js): Given a Blob containing the binary data of a `.maki` file, returns a JSON serializeable representation of the script.
- [Runtime](../runtime/index.ts): A JavaScript object mapping class' unique ids to JavaScript implementations of those classes.
- [Interpreter](./interpreter.js): Given a parsed `.maki` file, and a command offset, exectues the `.maki` script starting at that command, and returing the value returned from executing that function.
- [Virtual Machine](./virtualMachine.js): This ties all of the above pieces together. Given a Buffer containing a `.maki` script, a Runtime, and an instance of `System`, it parses the `.maki` file, and then binds the runtime into the parsed `.maki` program. This consists of populating the `System` variable, and binding the class ids defined in the script to the actual JavaScript implementations of those classes. Finally it kicks off execution by triggering `System.onScriptLoaded()`.

## Structure of a `.maki` file

See [Maki ByteCode](./maki-byptecode.md) for a description of the `.maki` file format.
