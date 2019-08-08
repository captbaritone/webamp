import parse from "./parser";
import { getClass, getFormattedId } from "./objects";
import { interpret } from "./interpreter";

// Note: if this incurs a performance overhead, we could pass a flag into the VM
// to not yield in production. In that case, we would never even enter the
// `while` loop.
function runGeneratorUntilReturn(gen) {
  let val = gen.next();
  while (!val.done) {
    val = gen.next();
  }
  return val.value;
}

export function run({ runtime, data, system, log, debugHandler }) {
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

  const handler = debugHandler || runGeneratorUntilReturn;

  // Bind top level hooks.
  program.bindings.forEach(binding => {
    const { commandOffset, variableOffset, methodOffset } = binding;
    const variable = program.variables[variableOffset];
    const method = program.methods[methodOffset];
    // const logger = log ? printCommand : logger;
    // TODO: Handle disposing of this.
    // TODO: Handle passing in variables.
    variable.hook(method.name, () => {
      // Interpret is a generator that yields before each command is exectued.
      // `handler` is reponsible for `.next()`ing until the program execution is
      // complete (the generator is "done"). In production this is done
      // synchronously. In the debugger, if execution is paused, it's done
      // async.
      handler(interpret(commandOffset, program, []));
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
