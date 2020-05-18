import React from "react";
import VariableClass from "../maki-interpreter/variable";
import Variable from "./Variable";

export default function Value({ value }) {
  if (value instanceof VariableClass) {
    return (
      <>
        Variable(
        <Variable variable={value} />)
      </>
    );
  }
  return value ? value.toString() : null;
}
