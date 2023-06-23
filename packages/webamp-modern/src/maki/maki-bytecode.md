# Maki Bytecode

Maki is a custom scripting language implemented to support user-defined user interfaces for "modern" Winamp skins. Maki compiles to a custom bytecode which gets interpreted by Winamp's skin engine. Neither the compiler nor the interpreter are open source, nor is the binary format documented. But, as part of the [Webamp](https://webamp.org/) project, I reverse engineered the bytecode, and wrote a JavaScript interpreter for it. This document is an attempt to document what I've learned about the Maki bytecode, its structure, and interpretation, in the hopes that it may prove useful if someone else wants to write a Maki interpreter, compiler, or simply better understand how modern Winamp skins work.

## Structure of a `.maki` file

A Maki binary file consists of several sections in a fixed order. There are seven sections which are always present. If the binary was compiled with the `\debug` flag enabled, there are two additional sections containing metadata not strictly needed for execution. There are no section headers, so the only way to know where one section ends and the next begins is to read them sequentially.

The sections are:

1. [Header](#1-header)
2. [Types/Classes](#2-typesclasses)
3. [Methods](#3-methods)
4. [Variables](#4-variables)
5. [Strings](#5-strings)
6. [Bindings](#6-bindings)
7. [Code](#7-code)
8. [Filepaths (debug)](#8-filepaths-debug)
9. [Instruction Line Numbers (debug)](#9-instruction-line-numbers-debug)

_Note: All numbers are little endian._

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

This section contains a table of method declarations. Later sections of the bytecode, like `call` opcodes, will reference methods via their offset into this table.

Note that some methods are not user-callable, but are conceptually more similar event listeners. For example, the `System.onScriptLoaded()` method is called by the system when the script is loaded. We'll learn more about these in the "bindings" section below.

1. A u32 indicating the length of the array/table.

For each method:

1. A u16, the least significant 8 bits (`& 0xff`) are an offset into the classes table. I'm not sure what the most significant 8 bits are.
2. A second u16. I'm not sure what this is. In practice it is always 0, which makes me suspect this is actually part of a u32 representation of the class offset.
3. A string representing the name of the method. This is encoded as a u16 indicating the length of the string, followed by that many bytes. I'm not sure if this is ASCII or UTF-8.

### 4. Variables

This section contains a table of variable declarations. Later sections of the bytecode, like call opcodes, will reference variables via their offset into this table.

These operate kinda like registers in that the compiler flattens all assignments out into a fixed size flat list. I'm not sure if the compiler tries to apply any optimizations to reuse them, or if there is simply a 1-1 mapping. Note that Maki does not support recursion or lambdas, so this flat list is sufficient.

1. A u32 indicating the length of the array/table.

For each variable:

1. u8 type offset
   - For object types (see flag below) this is an offset into the types table indicating the type of this variable.
   - For subtypes (see flag below) we use the offset into the variables table instead.
   - For primitives: 2 = int, 3 = float, 4 = double, 5 = boolean, and 6 = string.
2. A u8 (boolean) indicating if this is an object (true) or primitive (false).
3. A u16 indicating the subclass. We currently use this as just a boolean flag. Maybe this has more meaning if its 16 bits? Maybe we should really only be reading the first 8 bits?
4. Two u16s (A and B) indicating the initial value of the variable if it is a boolean or primitive. If it's a boolean, then A is the value. If it's an int, A is the value.
5. Two mystery u16s (or maybe a u32??)
6. A u8 boolean representing "global"
7. A u8 boolean representing "system" (no idea what this is used for)

### 5. Strings

Strings from the code are initialized as values in the variables table. Each string encodes its value and an offset into the variables table where it should be initialized.

1. A 32 bit number defines how many strings there are.

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
   - If the opcode has a type immediate, a u32 method offset into the types table.
3. In some cases, a u32 that is used for stack protection?
4. If the opcode is 112 (0x70), then an additional u8 whose significance I do not understand.

If the file was _not_ compiled with the `/debug` flag, then this should be the end of the file (EOF). If the file _was_ compiled with the `/debug` flag, then there is additional debug data sections to follow

### 8. Filepaths (debug)

_This section is only present if the file was compiled with the `/debug` flag._

This section contains a list of files that were included in the compilation of this script. This is used to generate debug information when the script is run.

1. A u32 indicating how many file paths there are.

For each file path:

1. A string encoded as a u32 indicating the length of the string, followed by that many ascii (utf-8?) bytes.

### 9. Instruction Line Numbers (debug)

_This section is only present if the file was compiled with the `/debug` flag._

This section contains a list of line numbers for a subset of the instructions.

1. A 32 bit number defines how many instructions are given line numbers.

For each instruction:

1. A u32 indicating the offset into the code section of the instruction.
2. A u32 indicating the file as an offset into the file paths section.
3. A u32 indicating the line number.

### 10. End of File

After reading all the above sections, we should be at the end of the file, having consumed all bytes.

## Opcodes

These are the opcodes as far as I've been able to determine.

- **Immediate** The type of immediate that follows the opcode (if any)
- **Consumes** The number of values popped off the stack by this opcode.
- **Leaves** The number of values pushed onto the stack by this opcode.

The VM is pretty simple. It maintains a value stack as well as a call stack. Operations push, pop and manipulate values on the value stack, while global function calls may push code offsets onto the call stack, which get popped off and jumped to by the `return` opcode. Note that Maki does not track call frames, all values are stored in the variables table. Recursion can lead to unexpected results.

Conceptually it looks like the values on the value stack are actually expected to always be pointers into the variables table, rather than values directly. This allows opcodes like `mov` to operate on stack values. Push two references onto the stack and then move the value pointed to by the first reference into the location pointed to by the second reference.

| Opcode | Name         | Immediate | Consumes | Leaves | Notes                                                                                                                                                   |
| ------ | ------------ | --------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0x00   | noop         | -         |          |        | Does nothing. Emits a debug warning. "Opcode 0 - NOP encountered, please check!"                                                                        |
| 0x01   | push         | variable  |          | 1      | Pushes the value of the variable onto the stack.                                                                                                        |
| 0x02   | pop          | -         | 1        |        | Pops the top value off the stack and discards it.                                                                                                       |
| 0x03   | pop to       | variable  | 1        |        | Pops the top value off the stack and assigns it to a variable.                                                                                          |
| 0x08   | equal        | -         | 2        | 1      |                                                                                                                                                         |
| 0x09   | not equal    | -         | 2        | 1      |                                                                                                                                                         |
| 0x0a   | greater than | -         | 2        | 1      |                                                                                                                                                         |
| 0x0b   | less than eq | -         | 2        | 1      |                                                                                                                                                         |
| 0x0c   | less than    | -         | 2        | 1      |                                                                                                                                                         |
| 0x0d   | less than eq | -         | 2        | 1      |                                                                                                                                                         |
| 0x10   | jump if not  | offset    | 1        |        | If value on the stack is falsy, jumps to the given code offset. (Note: Decompiler swaps these names)                                                    |
| 0x11   | jump if      | offset    | 1        |        | If value on the stack is truthy, jumps to the given code offset.                                                                                        |
| 0x12   | jump         | offset    |          |        | Jumps to the given code offset.                                                                                                                         |
| 0x18   | call         | method    | args + 1 | 1      | Pops the args off the stack, and then the object. Calls the method on that object with those args.                                                      |
| 0x19   | call global  | offset    |          |        | Pushes the current program counter onto a call stack and jumps to the provided code offset.                                                             |
| 0x21   | return       | -         |          |        | Pops a code location off the _call stack_ (not the value stack) and jumps to it.                                                                        |
| 0x28   | complete     | -         |          |        | Unsure what this does. Currently a noop in our implementation                                                                                           |
| 0x30   | mov          | -         | 2        | 1      | Pops the top value off the stack and assigns it to the second value on the stack. Pushes the top(?) value back onto the stack.                          |
| 0x38   | postinc      | -         | 1        | 1      | Pushes a new value onto the stack that is one greater than the top value on the stack.                                                                 |
| 0x39   | postdev      | -         | 1        | 1      | Pushes a new value onto the stack that is one less than the top value on the stack.                                                                     |
| 0x3a   | preinc       | -         | 1        | 1      | Increments the top value on the stack.                                                                                                                  |
| 0x3b   | predec       | -         | 1        | 1      | Decrements the top value on the stack.                                                                                                                  |
| 0x40   | add          | -         | 2        | 1      | Sums the top two values on the stack. Leaves the sum on the stack.                                                                                      |
| 0x41   | sub          | -         | 2        | 1      | Subtract the top value on the stack from the second value on the stack. Leaves the difference on the stack.                                             |
| 0x42   | mul          | -         | 2        | 1      | Multiplies the top two values on the stack. Leaves the product on the stack.                                                                            |
| 0x43   | div          | -         | 2        | 1      | Divides the second value on the stack by the top value on the stack. Leaves the quotient on the stack.                                                  |
| 0x44   | mod          | -         | 2        | 1      | Divides the second value on the stack by the top value on the stack. Leaves the remainder on the stack.                                                 |
| 0x48   | binary and   | -         | 2        | 1      | Performs a binary "and" on the top two values on the stack. Leaves the result on the stack.                                                             |
| 0x49   | binary or    | -         | 2        | 1      | Performs a binary "or" on the top two values on the stack. Leaves the result on the stack.                                                              |
| 0x41   | not          | -         | 1        | 1      | Inverts the truthiness of the top value on teh stack, `!`. Leaves the result on the stack.                                                               |
| 0x4a   | ???          |           |          |        | Unknown. Seen in disassembled VM.                                                                                                                       |
| 0x4b   | bitwise not  | -         | 1        | 1      | Takes the bitwise not of the top value on the stack. Leaves the result on the stack. (Compiler cannot parse ~, so not sure how this ever gets emitted). |
| 0x4c   | neg          | -         | 1        | 1      | Negates the top value on the stack. Leaves the result on the stack.                                                                                     |
| 0x50   | logical and  | -         | 2        | 1      | Performs a logical "and" on the top two values on the stack. Leaves the result on the stack.                                                            |
| 0x51   | logical or   | -         | 2        | 1      | Performs a logical "or" on the top two values on the stack. Leaves the result on the stack.                                                             |
| 0x58   | left shift   | -         | 2        | 1      | Shifts the second value on the stack left by the top value on the stack. Leaves the result on the stack.                                                |
| 0x58   | left shift   | -         | 2        | 1      | Shifts the second value on the stack left by the top value on the stack. Leaves the result on the stack.                                                |
| 0x60   | new          | type      | 0        | 1      | Creates a new object of the given type. Pushes the new object onto the stack.                                                                           |
| 0x68   | ???          |           |          |        | Unknown. Seen in `volume_06c50f380955d272ad14002ad6b6eb5b_bc79897771fd3dfa3d0b2de19fcf8af6.maki`                                                        |
| 0x70   | ???          |           |          |        | Unknown. Seen in disassembled VM.                                                                                                                       |
| 0x97   | delete       | -         | 1        |        | Pops a value off the stack and deletes it.                                                                                                              |

## Compiler Flags

The Maki compiler supports CLI flags, but I'm not aware of any official documentation. Below is my best understanding of what they do:

- `/outpath` - Sets the output path for the compiled `.maki` file.
- `/pause` - Causes the compiler to pause after writing the `.maki` file but before exiting. Presumably this is to allow for debugging of the compiler itself.
- `/df` | `/debugfile` - drops a `debug.syn` file containing an ascii table representation of the compiled output in the current working directory. See "Debug File" below for more information.
- `/d` | `/debug` - Adds additional debug metadata to the compiled `.maki` file.
- `/dumpsym` - Not sure what this does. No observable effect.

### Debug File

Here is a minimal example of what the `/debugfile` flag produces.

Input `.m` file:

```maki
#include "lib/std.mi"

System.onScriptLoaded()
{
	Int c = 155 + 255;
}
```

Output `debug.syn` file:

```
-- Variables Table ---------------------------------------------------
var# |                Class |                                    What
----------------------------------------------------------------------
0000 |               System |                                   System*
0001 |                  Int |                                     NULL
0002 |                  Int |                     __deprecated_runtime
0003 |               Double |                                        v
0004 |                  Int |                                        2
0005 |                  Int |                                    65535
0006 |                  Int |                                        1
0007 |               String |                           "runtimecheck"
0008 |                  Int |                                        0
0009 |                  Int |                                     last
000A |                  Int |                                      now
000B |                  Int |                                     5000
000C |               String |                  "This script requires "
000D |               String |        "Winamp 5.66 (skin version 1.36)"
000E |               String |                                  "Error"
000F |               String |                                       ""
0010 |               String |                                        s
0011 |               String |                                  "DEBUG"
0012 |                  Int |                                        s
0013 |                  Int |                                      155
0014 |                  Int |                                      255
0015 |                  Int |                                        c
-- Events Table ------------------------------------------------------
var# |         Code Pointer |                                    What
----------------------------------------------------------------------
0000 |                 0153 |                                      S.o
-- User Functions Table ----------------------------------------------
               Code Pointer |                                    What
----------------------------------------------------------------------
                       0000 |                             versionCheck
                       00F2 |                                    debug
                       011D |                                 debugInt
```

## Unanswered Questions

While we understand the structure of `.maki` files well enough to write a VM for them that appears to work, there is still a few mysteries which would be gratifying to solve.

- [ ] __Header__
  - [ ] What is the significance of the "FG" magic string?
  - [ ] What are the version numbers created by different versions of the compiler? Does Winamp use these in any way?
  - [ ] What is the 32 bit "something" after the version number?

- [ ] __Methods__
  - [ ] Why do we need the `0xff` bitmask when reading the class offset?
  - [ ] What is the second u16?

- [ ] __Variables__
  - [ ] If a variable is a subtype, should it's type really be a pointer into the `variables` table? Or should it be a pointer into the `types` table?
  - [ ] Why is the variable subclass flag 16 bits. Something more going on here?
  - [ ] Is our decoding of initial ints and doubles correct?
    - [ ] Try to create a u16 or u32 Int and see if it decodes correctly.
    - [ ] Try to create a large double and see if it decodes correctly.
  - [ ] What are unint 3 and 4 in the variable declaration?
  - [ ] Clarify the encoding of floats and doubles in the variable declaration.
  - [ ] What is the "system" flag in the variable declaration? What does it drive?
  - [ ] What is the "global" flag in the variable declaration? What does it drive?

- [ ] __Code__
  - [ ] Update our code to reflect the right immediate types for each opcode
  - [ ] What is opcode 112 and why does it have an extra byte?
  - [ ] What is stack protection?
  - [ ] Document stack protection
  - [ ] Rigorously read recompiled interpreter to find all opcodes
  - [ ] Opcode questions
    - [ ] What is opcode 0x4a?
    - [ ] What is opcode 0x68?
    - [ ] What is opcode 0x70?
    - [ ] What does `complete` 0x28 do?
    - [ ] Does 0x30 mov actually "move" or is it actually copy? What happens to the old value?
    - [ ] What's the difference between call and "strange call"
      - [ ] What does mov mean for newly created scalars like numbers that are the result of add?
    - [ ] Is 0x30 pushing the right value back onto the stack? Right now is't pushing the first value back on, but should it be the second?
      - [ ] How can this with with the 0x60 "new" opcode?
    - [ ] Does our implementation of 0x38 postinc actually work? Does creating a new value break mov?
    - [ ] Can add operate on strings?
  - [ ] Validate what "delete" does
  - [ ] Is it possible to actually get the compiler to emit a ~ bitwise compliment instruction?
  - [ ] Add tests for left and right shift and document

- [ ] Document startup code. The compiler injects some startup code that tests the VM version number and does some other stuff. Would be good to document what we know about that code.
- [ ] Could we look at the compiler in Ghidra and see what the cli flags are?

## Thanks

Reading Ralf Engels' Perl [Maki Decompiler](http://www.rengels.de/maki_decompiler/) ([archive](https://web.archive.org/web/20170311133226/http://www.rengels.de/maki_decompiler/)) provided a massive head start in understanding the structure of the bytecode. Thanks for writing the decompiler and keeping the code accessible for this long!
