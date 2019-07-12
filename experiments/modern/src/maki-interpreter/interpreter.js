const parse = require("./parser");
const { getClass, getFormattedId } = require("./objects");
const interpret = require("./virtualMachine");
const { printCommand } = require("./prettyPrinter");

function main({ runtime, data, system, log }) {
  const program = parse(data);

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

  // Bind top level hooks.
  program.bindings.forEach(binding => {
    const { commandOffset, variableOffset, methodOffset } = binding;
    const variable = program.variables[variableOffset];
    const method = program.methods[methodOffset];
    // TODO: Handle disposing of this.
    // TODO: Handle passing in variables.
    variable.hook(method.name, () => {
      interpret(commandOffset, program, { log });
    });
  });

  const { commands, variables } = program;
  commands.forEach((command, i) => {
    // printCommand({ i, command, stack: [], variables });
  });

  // Set the System global
  // TODO: We could confirm that this variable has the "system" flag set.
  program.variables[0].setValue(system);
  system.js_start();
}

module.exports = main;
