import runtime from "../runtime";

function quote(str) {
  return `"${str}"`;
}

export default function Variable({ variable }) {
  let type = "UNKOWN";
  switch (variable.typeName) {
    case "OBJECT": {
      const obj = runtime[variable.type];
      if (obj == null) {
        type = "Unknown object";
      } else {
        // Bit of a hack. We should probably fix this.
        type = obj.prototype.getclassname();
      }
      break;
    }
    case "SUBCLASS": {
      const obj = runtime[variable.type.type];
      if (obj == null) {
        type = "Unknown object";
      } else {
        type = obj.getClassName();
      }
      break;
    }
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
