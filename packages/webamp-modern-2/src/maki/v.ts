import BaseObject from "../skin/makiClasses/BaseObject";

export type Variable =
  | {
      type: "BOOLEAN";
      value: number; // 1 || 0
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
  newBool(value: boolean): Variable {
    return { type: "BOOLEAN", value: value ? 1 : 0 };
  },
};
