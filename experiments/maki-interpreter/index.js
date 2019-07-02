const parse = require("./parser");
const { getClass } = require("./objects");
const interpret = require("./interpreter");

function main({ runtime, buffer, system }) {
  const { commands, variables, classes, methods, bindings } = parse(buffer);

  // Set the System global
  variables[0].setValue(system);

  // Replace class hashes with those from the runtime
  const resolvedClasses = classes.map(hash => {
    const resolved = runtime[hash];
    if (resolved == null) {
      const klass = getClass(hash);
      console.warn(
        `Class missing from runtime: ${hash} expected ${klass.name}`
      );
    }
    return resolved;
  });

  bindings.forEach(binding => {
    const handler = () => {
      return interpret({
        start: binding.commandOffset,
        commands,
        variables,
        classes: resolvedClasses,
        runtime,
        methods
      });
    };

    if (binding.variableOffset === 0) {
      const obj = variables[binding.variableOffset].getValue();
      const method = methods[binding.methodOffset];
      obj[method.name](handler);
    } else {
      console.log("Not binding to non-system events", binding);
    }
  });

  system._start();
}

module.exports = main;
