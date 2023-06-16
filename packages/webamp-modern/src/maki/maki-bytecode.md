# Maki Bytecode

Maki is a custom scripting language implemented to support user-defined user interfaces for "modern" Winamp skins. Maki compiles to a custom bytecode which gets interpreterd by Winamp's skin engine. Neither the compiler nor the interpreter are open source, but as part of my [Webamp](https://webamp.org/) project, I reverse engineered the bytecode, and wrote a JavaScript interpreter for it. This document is an attempt to document what I've learned about the Maki bytecode, its structure, and interpretation in the hopes that it may prove useful if someone else wants to write a Maki interpreter, compiler, or simply better understand how modern Winamp skins work.

## Structure of a `.maki` file

The bytecode contained in a .maki file takes the following form (I think. I'm still trying to grock it). These are my notes trying to write down what I understand so far. Most of this was infered from reading the decompiler mentioned above.

The goal of this document is to give one enough information to implement a Maki virtual machine.

Note: All numbers are little endian.

### 1. Header

This first section contains metadata about the file.

1. Two bytes containing the "magic" string "FG". This signifies/validates that this is a `.maki` file. Not sure what the significance of "FG" is.
2. A u16 version number (which we currently ignore)
3. Some u32 bit something. We ignore this. Perhaps this is more version information?

### 2. Types/Classes

Maki is an object oriented language. This section contains a table of class declarations. Later sections of the bytecode will reference classes via their offset into this table. There are a number of built-in classes in Maki, which are declared in the `std.mi` file. Each declaration includes a GUID. For example:

```maki
// GUIDS
extern class @{51654971-0D87-4a51-91E3-A6B53235F3E7}@ @{00000000-0000-0000-0000-000000000000}@ Object;
extern class @{D6F50F64-93FA-49b7-93F1-BA66EFAE3E98}@ Object _predecl System;
extern class @{E90DC47B-840D-4ae7-B02C-040BD275F7FC}@ Object Container;
deprecated extern class @{00C074A0-FEA2-49a0-BE8D-FABBDB161640}@ Object Wac;
```

In essence, this section contains an array of GUIDs using an encoding.

1. A u32 indicating the length of the array/table.
2. 128 bytes of GUID data for each class. I believe these are encoded using variant 2 UUID encoding.

- https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
- https://devblogs.microsoft.com/oldnewthing/20220928-00/?p=107221

### 3. Methods

This section contains a table of method declarations. Later sections of the bytecode, like call opcodes, will reference methods via their offset into this table.

Note that some methods are not user-callable, but are conceptually more similar event listeners. For example, the `System.onScriptLoaded()` method is called by the system when the script is loaded. We'll learn more about these in the "bindings" section below.

1. A u32 indicating the length of the array/table.

For each method:

1. A u16, the least significant 8 bits (`& 0xff`) are an offset into the classes table. I'm not sure what the most significant 8 bits are.
2. A second u16. I'm not sure what this is. In practice it is always 0, which makes me suspect this is actually part of a u32 representation of the class offset.
3. A string representing the name of the method. This is encoded as a u16 indicating the length of the string, followed by that many bytes. I'm not sure if this is ASCII or UTF-8.

### 4. Variables

This section contains a table of variable declarations. Later sections of the bytecode, like call opcodes, will reference variables via their offset into this table.

These operate kinda like registers in that the compiler flattens all assignments out into a fixed size flat list. I'm not sure if the compiler tries to apply any optimizatinons to reuse them, or if there is simply a 1-1 mapping. Note that Maki does not support recursion or lambdas, so this flat list is sufficient.

1. A u32 indicating the length of the array/table.

For each variable:

1. u8 type offset
   - For object types (see flag below) this is an offset into the types table indicating the type of this variable.
   - For subtypes (see flag below) we use the offset into the variables table instead. I suspect this is a bug in our code.
   - For primitives: 2 = int, 3 = float, 4 = double, 5 = boolean, and 6 = string.
2. A u8 (boolean) indicating if this is an object (true) or pimitive (false).
3. A u16 indicating the subclass. We currently use this as just a boolean flag. Maybe this has more meaning if its 16 bits? Maybe we should really only be reading the first 8 bits?
4. Two u16s (A and B) indicating the initial value of the variable if it is a boolean or primitive. If it's a boolean, then A is the value. If it's an int, A is the value.
5. Two mystery u16s (or maybe a u32??)
6. A u8 boolean representing "global"
7. A u8 boolean representing "system" (no idea what this is used for)

### 5. Strings

Strings from the code are initialized as values in the variables table. Each string encodes its value and an offset into the variables table where it should be initialized.

1. A 32 bit number defines how many strigns there are.

For each string:

1. A 32 bit number representing an offset into the variables table.
2. A 16 bit number representing how long the string is, followed by that many ascii (utf-8?) bytes.

### 6. Bindings

Every bit of user-defined Maki code gets kicked off by a user-created binding. These are something like event-listeners. For example, the skin author can define a binding to be run whenever a given button is clicked. Even the conceptual `main()` part of the script is defined this way: `System.onScriptLoaded()`.

Another way to think of these is as user-defined functions that are called by the system. The system calls them, and passes in a bunch of arguments. The user-defined function then does whatever it wants, and returns a value. The system then does something with that value.

Note that bindings are applied to _variables_ not specific instances. If you assign a new object to the variable after the bindings has been assigned, the binding with now listen for events on that newly assigned object.

1. A 32 bit number defines how many binding there are.

For each binding:

1. A 32 bit number representing an offset into the variables table. This is the variable that holds the object that the binding is attached to.
2. A 32 bit number representing an offset into the methods table. This defines method to which the binding is attached.
3. A 32 bit number representing the binary offset. This is the offset into the bytecode where the user supplied code for this binding starts.

### 7. Code

1. A 32 bit number defines how many bytes of code there are.

These bytes of code consist of individual opcodes. Each opcode consists of:

1. A u8 opcode
2. Possibly some immediate value (extra data) depending on the opcode.
   - If the opcode has a code offset immediate, a u32 command offset relative to the current position. Note that for some reason we find we need to add 5 to this number. Perhaps it's actually relative to the `pc` which is expected to always point at the next instruction?
   - If the opcode has a variable immediate, a u32 variable offset into the variables table.
   - If the opcode has a method immediate, a u32 method offset into the methods table.
3. In some cases, a u32 that is used for stack protection?
4. If the opcode is 112 (0x70), then an additional u8 whose significance I do not understand.

## Opcodes

These are the opcodes as far as I've been able to determine.

- **Immediate** The type of immediate that follows the opcode (if any)
- **Consumes** The number of values popped off the stack by this opcode.
- **Leaves** The number of values pushed onto the stack by this opcode.

The VM is pretty simple. It maintains a value stack as well as a call stack. Operations push, pop and manipulate values on the value stack, while global function calls may push code offsets onto the call stack, which get popped off and jumpped to by the `return` opcode. Note that Maki does not track call frames, all values are stored in the variables table. Recursion can lead to unepxected results.

| Opcode | Name               | Immediate | Consumes | Leaves | Notes                                                                                                |
| ------ | ------------------ | --------- | -------- | ------ | ---------------------------------------------------------------------------------------------------- |
| 0x01   | push               | variable  |          | 1      | Pushes the value of the variable onto the stack.                                                     |
| 0x02   | pop                | -         | 1        |        | Pops the top value off the stack and discards it.                                                    |
| 0x03   | pop to             | variable  | 1        |        | Pops the top value off the stack and assigns it to a variable.                                       |
| 0x08   | equal (`==`)       | -         | 2        | 1      |                                                                                                      |
| 0x09   | not equal (`!=`)   | -         | 2        | 1      |                                                                                                      |
| 0x0a   | greater than (`>`) | -         | 2        | 1      |                                                                                                      |
| 0x0b   | less than (`>=`)   | -         | 2        | 1      |                                                                                                      |
| 0x0c   | less than (`<`)    | -         | 2        | 1      |                                                                                                      |
| 0x0d   | less than (`<=`)   | -         | 2        | 1      |                                                                                                      |
| 0x10   | jump if not        | offset    | 1        |        | If value on the stack is falsy, jumps to the given code offset. (Note: Decompiler swaps these names) |
| 0x11   | jump if            | offset    | 1        |        | If value on the stack is truthy, jumps to the given code offset.                                     |
| 0x12   | jump               | offset    |          |        | Jumps to the given code offset.                                                                      |
| 0x18   | call               | method    | args + 1 | 1      | Pops the args off the stack, and then the object. Calls the method on that object with those args.   |
| 0x19   | call global        | offset    |          |        | Pushes the current program counter onto a call stack and jumps to the provided code offset.          |
| 0x1a   | return             | -         |          |        | Pops a code location off the _call stack_ (not the value stack) and jumps to it.                     |

TODO: Complete lis of opcodes.

## Unanswered Questions

While we understand the structure of `.maki` files well enough to write a VM for them that appears to work, there is still a few mysteries which would be gratifying to solve.

- [ ] What is the significance of the "FG" magic string?
- [ ] What are the version numbers created by different versions of the compiler? Does Winamp use these in any way?
- [ ] What is the 32 bit "something" after the version number?
- [ ] If a variable is a subtype, should it's type really be a pointer into the `variables` table? Or should it be a pointer into the `types` table?
- [ ] Why is the variable subclass flag 16 bits. Something more going on here?
- [ ] Is our decoding of initial ints and doubles correct?
  - [ ] Try to create a u16 or u32 Int and see if it decodes correctly.
  - [ ] Try to create a large double and see if it decodes correctly.
- [ ] What are unint 3 and 4 in the variable declaration?
- [ ] What is the "system" flag in the variable declaration?
- [ ] Parse GUIDs more intentionally such that they can serialize directly without having to be reformatted.
- [ ] Why are method class offsets encoded so weird. I would expect just u32s, but they are u16s with the most significant 8 bits being something else.
- [ ] Are method names encoded as ascii or utf-8? (We currently parse as utf-8, but I'm not sure if that is correct.)
- [ ] What is opcdoe 112 and why does it have an extra byte?
- [ ] What is stack protection?
- Check how constant strings are encoded
- Check how method names are encoded (is it even possible to reference a non-ascii method?)

## Thanks

Reading Ralf Engels' Perl [Maki Decompiler](http://www.rengels.de/maki_decompiler/) ([archive](https://web.archive.org/web/20170311133226/http://www.rengels.de/maki_decompiler/)) provided a massive head start in understanding the structure of the bytecode. Thanks for writing the decompiler and keeping the code accessible for this long!
