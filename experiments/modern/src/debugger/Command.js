import React from "react";
import Variable from "./Variable";
export default function Command({ command, variables }) {
  const arg = command.arguments[0];
  let foo = null;
  switch (command.opcode) {
    case 1:
      foo = (
        <span>
          Variable(
          <Variable variable={variables[arg]} />)
        </span>
      );
      break;
    default:
      foo = null;
  }
  return (
    <>
      ({command.opcode}) {command.command.name.toUpperCase()} {foo}
    </>
  );
}
