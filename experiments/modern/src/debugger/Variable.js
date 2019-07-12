import runtime from "../maki-interpreter/runtime";

function quote(str) {
  return `"${str}"`;
}

export default function Variable({ variable }) {
  let type = "UNKOWN";
  switch (variable.typeName) {
    case "OBJECT":
      const obj = runtime[variable.type];
      if (obj == null) {
        type = "Unknown object";
      } else {
        type = obj.getClassName();
      }
      break;
    case "STRING": {
      const value = variable.getValue();
      return `${variable.typeName}(${value == null ? "NULL" : quote(value)})`;
    }
    case "INT":
    case "FLOAT":
    case "DOUBLE":
    case "BOOLEAN":
      const value = variable.getValue();
      return `${variable.typeName}(${value == null ? "NULL" : value})`;
    default:
      throw new Error(`Unknown variable type ${variable.typeName}`);
  }
  return type;
}
