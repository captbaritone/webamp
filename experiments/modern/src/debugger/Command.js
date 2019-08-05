import React from "react";
import Variable from "./Variable";
import { COMMANDS } from "../maki-interpreter/constants";

export default function Command({ command, variables }) {
  const { arg } = command;
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
      ({command.opcode}) {COMMANDS[command.opcode].name.toUpperCase()} {foo}
    </>
  );
}
