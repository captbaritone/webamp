const parse = require("./parser");
const { getClass, getFormattedId } = require("./objects");
const interpret = require("./virtualMachine");

function main({ runtime, data, system, log }) {
  const program = parse(data);

  // Set the System global
  program.variables[0].setValue(system);

  // Replace class hashes with actual JavaScript classes from the runtime
  program.classes = program.classes.map(hash => {
    const resolved = runtime[hash];
    if (resolved == null && log) {
      const klass = getClass(hash);
      console.warn(
        `Class missing from runtime: ${hash}`,
        klass == null
          ? `(formatted ID: ${getFormattedId(hash)})`
          : `expected ${klass.name}`
      );
    }
    return resolved;
  });

  // Bind toplevel handlers.
  program.bindings.forEach(binding => {
    const handler = () => {
      return interpret(binding.commandOffset, program, { log });
    };

    const variable = program.variables[binding.variableOffset];

    const method = program.methods[binding.methodOffset];
    variable.hook(method.name, handler);
  });

  system.js_start();
}

module.exports = main;
