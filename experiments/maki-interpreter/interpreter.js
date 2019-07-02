const parse = require("./parser");
const { getClass } = require("./objects");
const interpret = require("./virtualMachine");

function main({ runtime, buffer, system }) {
  const program = parse(buffer);

  // Set the System global
  program.variables[0].setValue(system);

  // Replace class hashes with those from the runtime
  program.classes = program.classes.map(hash => {
    const resolved = runtime[hash];
    if (resolved == null) {
      const klass = getClass(hash);
      console.warn(
        `Class missing from runtime: ${hash} expected ${klass.name}`
      );
    }
    return resolved;
  });

  program.bindings.forEach(binding => {
    const handler = () => {
      return interpret(binding.commandOffset, program);
    };

    if (binding.variableOffset === 0) {
      const obj = program.variables[binding.variableOffset].getValue();
      const method = program.methods[binding.methodOffset];
      obj[method.name](handler);
    } else {
      console.warn(
        "Not Implemented: Not binding to non-system events",
        binding
      );
    }
  });

  system._start();
}

module.exports = main;
