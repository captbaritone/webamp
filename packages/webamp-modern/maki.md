# MAKI

In the process of starting to build support for "modern" Winamp skins for Webamp, we built an interpreter for MAKI (Make A Killer Interface) byte code, the scripting language used for adding custom functionality to modern Winamp skins.

Most of what we learned came from the Ralf Engels' [Maki Decompiler](http://www.rengels.de/maki_decompiler/) (which seems to be offline at the moment) and trial and error testing of what the compiler output.

My goal here is to document the structure and semantics of the compiled `.maki` file that the MAKI compiler outputs and Winamp interprerates.

## Notation

- Terminal symbols are written in **bold**
- Nonterminal symbols are written in _italics_
- Productions are written _sym_ ::= A B C
- Vectors are written as vec(_A_) where _A_ is the production being enumerated.

### _u16_

TODO: Clarify encoding.

Encoded as little endien.

### _u32_

TODO: Clarify encoding.

Encoded as little endien.

### _Vector_

_Vectors_ are encoded with their _u32_ length followed by the encoding of their element sequence.

### _String_

A string is encoded as a _u16_ indicating the length of the string n followed by n bytes of ASCII.

## Module Sections

_module_ ::= _header_ _classes_ _methods_ _variables_ _constants_ _bindings_ _codes_

A module (file) consists of the above seven consecutive sections.

## Header

_header_ ::= _magic_ _moduleVersion_ _extraVersion_

_magic_ ::= **`0x46`** **`0x47`**

_moduleVersion_ ::= _u16_  
_extraVersion_ ::= _u32_

The _magic_ that beings the header consists of the binary representation of the ASCII characters "FG". I'm not sure what, if any, significance there is to this choice. These characters are simply here for the parser to validate that it's actually geting a `.maki` file.

_moduleVersion_ represents the version of the compiler with which this module was compiled.

_extraVersion_ is unused. I suspect that it may be additional version information, but I don't know for sure.

## Classes

_classes_ ::= vec(_identifier_)  
_identifier_ ::= _u32_ _u32_ _u32_ _u32_

The _identifier_ represents the unique ID found in the `std.mi` against which the module was compiled. The hex string can be computed by interpreting each _u32_ as a hex string (left padded to 8 characters) and then concatenating them.

Note: The ASCII representation we construct above may not directly match that found in `std.mi` due to the [oddities of UUID encoding](https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding). We use the following function to map from our representation to the one fond in `std.mi`:

```JavaScript
function getFormattedId(id) {
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
  const formattedId = id.replace(
    /(........)(....)(....)(..)(..)(..)(..)(..)(..)(..)(..)/,
    "$1$3$2$7$6$5$4$11$10$9$8"
  );
  return formattedId.toLowerCase();
}
```

## Methods

_methods_ ::= vec(_method_)
_method_ ::= _classCode_ _extraClassCode_ _string_
_classCode_ ::= _u16_
_extraClassCode_ ::= _u16_

We use `classCode & 0xff` to derive the "class offset" and then discard/ignore `_extraClassCode_. It's possible that this is actually intended to be parsed as a single _u32_ and we just did something wrong.

The "class offset" is an offset into the _classes_ vector and indicates to which class this method belongs.

The final _string_ is the name of this method.

## Variables

_variables_ ::= vec(_variable_)  
_variable_ ::= _typeOffset_ _object_ _subclass_ _uint1_ _uint2_ _uint3_ _uint4_ _global_ _system_  
_typeOffset_ ::= **byte**  
_object_ ::= **byte**  
_subclass_ ::= _u16_  
_uint1_ ::= _u16_  
_uint2_ ::= _u16_  
_uint3_ ::= _u16_  
_uint4_ ::= _u16_  
_global_ ::= **byte**  
_system_ ::= **byte**

Each variable declared here is an entry in our variables table. There are three different types of variables: subclasses, objects, and primitives.

Our interpretation of _variables_ is a bit squirrely but does seem to work according to our tests. Our method of determining which type we have seems suspect and there are number of bytes which go completely ignored.

### Subclass

If _subclass_ is truthy, this variable is a subclass and _typeOffset_ represents an earlier offset into _variables_ which is this variables superclass.

_global_ indicates if this variable is global.

In the subclass case all other values are ignored.

### Object

If _object_ is truthy, this variable is an object and _typeOffset_ is an offset into the _classes_ vector which is this variables type.

_global_ indicates if this variable is global.

In the object case all other values are ignored.

### Primitives

If a variable is neithe a subclass nor an object, it is a primitive. _typeOffset_ determines which type of primitive it is. There are at least five types of primitives:

- Int (2)
- Float (3)
- Double (4)
- Boolean (5)
- String (6)

The fact that index 0 and 1 are not used is confusing, but in our testing we did not discover any `.maki` files that referenced them.

If _typeOffset_ is **2** this variable is an Int and its value can be found in _uint1_.

If _typeOffset_ is **3** this variable is a Float. We use the following function to derive the floating value from _uint1_ and _uint2_:

```JavaScript
function decodeFloat(uint1, unint2) {
  const exponent = (uint2 & 0xff80) >> 7;
  const mantisse = ((0x80 | (uint2 & 0x7f)) << 16) | uint1;
  return mantisse * 2.0 ** (exponent - 0x96);
}
```

If _typeOffset_ is **4** this variable is a Double. We currently derive the value exactly the same as we do for floats. This is likely wrong. Probably we should also be looking at _uint3_ and _uint4_.

If _typeOffset_ is **5** this variable is a Boolean and its value can be found in _uint1_.

If _typeOffset_ is **6** this variable is a String. The actual string will be found in the _constants_ section which will reference this variable via its offset in the _variables_ vector.

## Constants

_constants_ ::= vec(_constant_)  
_constant_ ::= _variableOffset_ _string_  
_variableOffset_ ::= _u32_

String constants are encoded in this section. _variableOffset_ is the offset into the _variables_ vector that is a string and has this string as its initial value.

_string_ is the actual value.

## Bindings

_bindings_ ::= vec(_binding_)  
_binding_ ::= _variableOffset_ _methodOffset_ _binaryOffset_  
_methodOffset_ ::= _u32_  
_binaryOffset_ ::= _u32_

MAKI allows you to define behavior for events on an instance of an object. These are represented as _bindings_ in the byte code.

_variableOffset_ is an offset into the _variables_ vector. It indicates the instance to which this binding is attached.

_methodOffset_ is an offset into the _methods_ vector and indicates the method on object instance that will be called.

_binaryOffset_ is the byte offset into the _codes_ section where the opcodes for this method begin.

## Code

_codes_ ::= _codeLength_ _code_  
_codeLength_ ::= _u32_

_codeLength_ indicates the byte size of _code_.

_code_ is made up of a stream of opcodes, some of which include an "immediate" values. For the opcodes that do include an immediate, the immediate is encoded as a _u32_. See the Opcodes table below for a list of opcodes and their behavior.

There are a few small quirks to reading _code_ which I _beleive_ have to do with stack protection, but I honestly don't understand them.

After we parse each opcode, we must peek at the next _u32_. If it's `>= 0xffff0000` and `<= 0xffff000f`, then we must consume that _u32_ and throw it away.

After parsing opcode `112` we must consume and throw away a single **byte**. I don't know why or what that byte might contain.

## Opcodes

Opcodes may or may not have an associated immediate value. If it does, there are a number of different types:

- var: Offset into the _variables_ vector
- inst: Relative instruction pointer (ip) value
- method: Offset into the _methods_ vector
- class: Offset into the _classes_ vector

| Opcode | Name        | Immediate | Behavior                                                                       |
| ------ | ----------- | --------- | ------------------------------------------------------------------------------ |
| 1      | push        | var       | Pushes variable onto the stack                                                 |
| 2      | pop         |           | Pops a variable off the stack and discards it                                  |
| 3      | popTo       | var       | Pops a variable off the stack stores it into var                               |
| 8      | eq          |           | Pops a and b. Leaves a == b on the stack                                       |
| 9      | neq         |           | Pops a and b. Leaves a != b on the stack                                       |
| 10     | gt          |           | Pops a and b. Leaves a > b on the stack                                        |
| 11     | gte         |           | Pops a and b. Leaves a >= b on the stack                                       |
| 12     | lt          |           | Pops a and b. Leaves a < b on the stack                                        |
| 13     | lte         |           | Pops a and b. Leaves a <= b on the stack                                       |
| 16     | jumpIf      | inst      | Pops a value and jumps to inst if it is _false_                                |
| 17     | jumpIfNot   | inst      | Pops a value and jumps to inst if it is _true_                                 |
| 18     | jump        | inst      | Jumps to inst                                                                  |
| 24     | call        | method    | Pops off a value for each arg and one for the object                           |
| 112    | strangeCall | method    | Same as above? Not sure why this is different.                                 |
| 25     | callGlobal  | inst      | Jump to inst and execute until return, leaves returned value on the stack      |
| 33     | return      |           | Pops value off stack and returns it to caller                                  |
| 40     | complete    |           | ?                                                                              |
| 48     | mov         |           | Pops a and b, and assigns variable b the value of a. Leaves value on the stack |
| 56     | postinc     |           | Pops a variable, increments it, and pushes original value back on the stack    |
| 57     | postdec     |           | Pops a variable, decrements it, and pushes original value back on the stack    |
| 58     | preinc      |           | Pops a variable, increments it, and pushes new value back on the stack         |
| 59     | postinc     |           | Pops a variable, decrements it, and pushes new value back on the stack         |
| 64     | add         |           | Pops a and b. Leaves a + b on the stack                                        |
| 65     | sub         |           | Pops a and b. Leaves a - b on the stack                                        |
| 66     | mul         |           | Pops a and b. Leaves a \* b on the stack                                       |
| 67     | div         |           | Pops a and b. Leaves a / b on the stack                                        |
| 68     | mod         |           | Pops a and b. Leaves a % b on the stack                                        |
| 72     | band        |           | Pops a and b. Leaves a & b on the stack                                        |
| 73     | bor         |           | Pops a and b. Leaves a \| b on the stack                                       |
| 74     | not         |           | Pops a. Leaves !a                                                              |
| 76     | neg         |           | Pops a. Leaves -a                                                              |
| 80     | land        |           | Pops a and b. Leaves a && b                                                    |
| 81     | lor         |           | Pops a and b. Leaves a \|\| b                                                  |
| 88     | shiftl      |           | Pops a and b. Leaves a << b                                                    |
| 89     | shiftr      |           | Pops a and b. Leaves a >> b                                                    |
| 96     | new         | class     | Constructs a new instance of class and leaves it on the stack                  |
| 97     | delete      |           | Pops variable off the stack and deletes it                                     |

## TODO

- Document int8 production rule
- Document u16 production rule
- Document u32 production rule
- Can we get a sample of what _extraVersion_ contains?
- What are the four 32s of an _identifier_?
- Could _extraClassCode_ actually be the second half of _classCode_?
- What happens if we try to encode an int larger than uint16? Do we spill over into uint2?
- What happens if we try to encode a negative int?
- What happens if we try to encode a high precision float? Does it spill over into uint3 or uint4?
- Are we really limited to 255 classes/superclasses. Can we test these cases? It seems like _typeOffset_ is just a byte so we fail if we had more.
- Do we know what _sytem_ means?
- Can we express variables using explicit productions?
- Does _subclass_ have an interesting value when it's true?
- Does _object_ have an interesting value when it's true?
- What is the byte the follows a strangecall?
