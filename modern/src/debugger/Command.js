import React from "react";
import Variable from "./Variable";
import { COMMANDS } from "../maki-interpreter/constants";

export default function Command({ command, variables }) {
  const { arg } = command;
  let foo;

  if (command.opcode === 1) {
    foo = (
      <span>
        Variable(
        <Variable variable={variables[arg]} />)
      </span>
    );
  } else {
    foo = null;
  }

  return (
    <>
      ({command.opcode}) {COMMANDS[command.opcode].name.toUpperCase()} {foo}
    </>
  );
}
