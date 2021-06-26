import BaseObject from "../skin/BaseObject";

export type Variable =
  | {
      type: "BOOL";
      value: boolean;
    }
  | {
      type: "INT" | "FLOAT" | "DOUBLE";
      value: number;
    }
  | {
      type: "STRING";
      value: string;
    }
  | {
      type: "OBJECT";
      value: BaseObject;
    }
  | {
      type: "NULL";
      value: null;
    };

export type DataType =
  | "BOOLEAN"
  | "INT"
  | "FLOAT"
  | "DOUBLE"
  | "STRING"
  | "NULL"
  | "OBJECT";

export const V = {
  // TODO: Split boolean out into its own method
  newInt(value: number | boolean): Variable {
    return { type: "INT", value: Number(value) };
  },
};
