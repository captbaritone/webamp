import Variable from "./variable";
import runtime from "../runtime";

// Debug utility to pretty print a value/variable
function printValue(value) {
  if (!(value instanceof Variable)) {
    return value;
  }
  const variable = value;
  let type = "UNKOWN";
  switch (variable.typeName) {
    case "OBJECT":
      const obj = runtime[variable.type];
      if (obj == null) {
        type = "Unknown object";
      } else {
        type = obj.getclassname();
      }
      break;
    case "STRING":
      const str = variable.getValue();
      type = `STRING(${str})`;
      break;
    case "INT":
      type = "INT";
      break;
    case "FLOAT":
      type = "FLOAT";
      break;
    case "DOUBLE":
      type = "DOUBLE";
      break;
    case "BOOLEAN":
      type = "BOOLEAN";
      break;
    default:
      throw new Error(`Unknown variable type ${variable.typeName}`);
  }
  return `Variable(${type})`;
}

function printCommand({ i, command, stack, variables }) {
  console.log(
    `${i} (${command.start} + ${command.offset})`,
    command.command.name.toUpperCase(),
    command.opcode,
    printValue(variables[command.arg])
  );
  stack.forEach((value, j) => {
    const name = printValue(value, { runtime });
    console.log("    ", j + 1, name);
  });
}

export default { printCommand };
