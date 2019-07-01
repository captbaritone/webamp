var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var COMMANDS = require("./constants").COMMANDS;
var Command = require("./command");
var _a = require("./objects"), getClass = _a.getClass, getObjectFunction = _a.getObjectFunction;
var Variable = require("./variable");
var MAGIC = "FG";
var ENCODING = "binary";
var PRIMITIVE_TYPES = {
    5: "BOOLEAN",
    2: "INT",
    3: "FLOAT",
    4: "DOUBLE",
    6: "STRING"
};
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.prototype._readMagic = function () {
        var magic = this._readStringOfLength(MAGIC.length);
        if (magic !== MAGIC) {
            throw new Error("Magic number does not mach. Is this a maki file?");
        }
        return magic;
    };
    Parser.prototype._readVersion = function () {
        // No idea what we're actually expecting here.
        this._i += 2;
    };
    Parser.prototype._readTypes = function () {
        var count = this._readUInt32LE();
        var types = [];
        while (count--) {
            var identifier = "";
            var chunks = 4;
            while (chunks--) {
                identifier += this._readUInt32LE()
                    .toString(16)
                    .padStart(8, "0");
            }
            var klass = getClass(identifier);
            if (klass == null) {
                throw new Error("Could not find class for id: " + identifier);
            }
            types.push(klass);
        }
        return types;
    };
    Parser.prototype._readFunctionsNames = function (_a) {
        var types = _a.types;
        var count = this._readUInt32LE();
        var functionNames = [];
        while (count--) {
            var classCode = this._readUInt16LE();
            // Offset into our parsed types
            var typeOffset = classCode & 0xff;
            var dummy2 = this._readUInt16LE();
            var name_1 = this._readString();
            var klass = types[typeOffset];
            functionNames.push({
                dummy2: dummy2,
                name: name_1,
                "class": klass,
                "function": getObjectFunction(klass, name_1)
            });
        }
        return functionNames;
    };
    Parser.prototype._readVariables = function (_a) {
        var types = _a.types;
        var count = this._readUInt32LE();
        var variables = [];
        while (count--) {
            var typeOffset = this._readUInt8();
            var object = this._readUInt8();
            var subClass = this._readUInt16LE();
            var uinit1 = this._readUInt16LE();
            var uinit2 = this._readUInt16LE();
            var uinit3 = this._readUInt16LE();
            var uinit4 = this._readUInt16LE();
            var global_1 = this._readUInt8();
            var system = this._readUInt8();
            var props = {
                typeOffset: typeOffset,
                object: object,
                subClass: subClass,
                uinit1: uinit1,
                uinit2: uinit2,
                uinit3: uinit3,
                uinit4: uinit4,
                global: global_1,
                system: system
            };
            if (object) {
                var type = types[typeOffset];
                if (type == null) {
                    throw new Error("Invalid type");
                }
                variables.push(new Variable(__assign({}, props, { type: type })));
            }
            else if (subClass) {
                var type = variables[typeOffset];
                if (type == null) {
                    throw new Error("Invalid type");
                }
                variables.push(new Variable(__assign({}, props, { type: type })));
            }
            else {
                var typeName = PRIMITIVE_TYPES[typeOffset];
                if (typeName == null) {
                    throw new Error("Invalid type");
                }
                var value = null;
                switch (typeName) {
                    // BOOLEAN
                    case PRIMITIVE_TYPES[5]:
                    // INT
                    case PRIMITIVE_TYPES[2]:
                        value = uinit1;
                        break;
                    case PRIMITIVE_TYPES[3]:
                    case PRIMITIVE_TYPES[4]:
                        var exponent = (uint2 & 0xff80) >> 7;
                        var mantisse = ((0x80 | (uint2 & 0x7f)) << 16) | uint1;
                        value = mantisse * Math.pow(2.0, (exponent - 0x96));
                        break;
                    case PRIMITIVE_TYPES[6]:
                        // This will likely get set by constants later on.
                        break;
                }
                if (value == null) {
                    // throw new Error("Failed to set value");
                }
                var variable = new Variable(__assign({}, props, { type: { name: typeName } }));
                variable.setValue(value);
                variables.push(variable);
            }
        }
        return variables;
    };
    Parser.prototype._readConstants = function (_a) {
        var variables = _a.variables;
        var count = this._readUInt32LE();
        var constants = [];
        while (count--) {
            var i = this._readUInt32LE();
            var variable = variables[i];
            var value = this._readString();
            // TODO: Don't mutate
            variable.setValue(value);
            constants.push({ varNum: i, value: value });
        }
        return constants;
    };
    Parser.prototype._readFunctions = function () {
        var count = this._readUInt32LE();
        var functions = [];
        while (count--) {
            var varNum = this._readUInt32LE();
            var funcNum = this._readUInt32LE();
            var offset = this._readUInt32LE();
            functions.push({ varNum: varNum, offset: offset, funcNum: funcNum });
        }
        return functions;
    };
    Parser.prototype._readUInt32LE = function () {
        var int = this._buffer.readUInt32LE(this._i);
        this._i += 4;
        return int;
    };
    Parser.prototype._readUInt16LE = function () {
        var int = this._buffer.readUInt16LE(this._i);
        this._i += 2;
        return int;
    };
    Parser.prototype._readUInt8 = function () {
        var int = this._buffer.readUInt8(this._i);
        this._i++;
        return int;
    };
    Parser.prototype._readStringOfLength = function (length) {
        var str = this._buffer.toString(ENCODING, this._i, this._i + length);
        this._i += length;
        return str;
    };
    Parser.prototype._readString = function () {
        return this._readStringOfLength(this._readUInt16LE());
    };
    Parser.prototype._decodeCode = function (_a) {
        var commandsBuffer = _a.commandsBuffer, types = _a.types, variables = _a.variables, functionNames = _a.functionNames, functions = _a.functions, start = _a.start;
        var pos = start;
        var localFunctions = {};
        var results = [];
        var done = false;
        while (pos < commandsBuffer.length && !done) {
            var command = new Command({
                commandsBuffer: commandsBuffer,
                pos: pos,
                types: types,
                variables: variables,
                functionNames: functionNames,
                localFunctions: localFunctions
            });
            pos += command.size;
            results.push(command);
            // Only parse until the return value
            if (command.opcode === 33) {
                done = true;
            }
        }
        // TODO: Don't mutate
        Object.values(localFunctions).forEach(function (localFunction) {
            functions.push(localFunction);
        });
        functions.sort(function (a, b) {
            // TODO: Confirm that I have this the right way round
            return a.offset - b.offset;
        });
        return results;
    };
    Parser.prototype.parse = function (buffer) {
        var _this = this;
        this._buffer = buffer;
        this._i = 0;
        var magic = this._readMagic();
        this._readVersion();
        this._readUInt32LE(); // Not sure what we are skipping over here. Just some UInt 32.
        var types = this._readTypes();
        var functionNames = this._readFunctionsNames({ types: types });
        var variables = this._readVariables({ types: types });
        var constants = this._readConstants({ variables: variables });
        var functions = this._readFunctions();
        var length = this._readUInt32LE();
        var commandsBuffer = this._buffer.slice(this._i, this._i + length);
        this._i += length;
        functions.forEach(function (func) {
            func.commands = _this._decodeCode({
                commandsBuffer: commandsBuffer,
                start: func.offset,
                types: types,
                variables: variables,
                functionNames: functionNames,
                functions: functions
            });
        });
        return {
            magic: magic,
            types: types,
            functionNames: functionNames,
            variables: variables,
            constants: constants,
            functions: functions
        };
    };
    return Parser;
}());
function parse(buffer) {
    var parser = new Parser();
    return parser.parse(buffer);
}
module.exports = { parse: parse };
