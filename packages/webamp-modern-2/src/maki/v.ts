import GuiObj from "../skin/GuiObj";

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
      value: GuiObj;
    }
  | {
      type: "NULL";
      value: null;
    };

export type DataType = Pick<Variable, "type">;

export const V = {
  // TODO: Split boolean out into its own method
  newInt(value: number | boolean): Variable {
    return { type: "INT", value: Number(value) };
  },
};
