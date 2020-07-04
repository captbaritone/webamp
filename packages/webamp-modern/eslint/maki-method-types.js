const {
  getMakiObjectfromClassDeclarationNode,
} = require("./maki-eslint-utils");

const TYPE_MAP = {
  // This might be wrong. Maybe it really is an empty string? Or Null?
  "": {
    typeScriptName: "TSVoidKeyword",
    stringRepresentation: "void",
  },
  string: {
    typeScriptName: "TSStringKeyword",
    stringRepresentation: "string",
  },
  double: {
    typeScriptName: "TSNumberKeyword",
    stringRepresentation: "number",
  },
  int: {
    typeScriptName: "TSNumberKeyword",
    stringRepresentation: "number",
  },
  boolean: {
    typeScriptName: "TSBooleanKeyword",
    stringRepresentation: "boolean",
  },
  float: {
    typeScriptName: "TSNumberKeyword",
    stringRepresentation: "number",
  },
  any: {
    typeScriptName: "TSAnyKeyword",
    stringRepresentation: "any",
  },
};

function getTypeData(makiType) {
  const type = TYPE_MAP[makiType.toLowerCase()];
  if (type == null) {
    // console.warn(`Could not find type for "${makiType}"`);
  }
  return type;
}

module.exports = {
  meta: {
    docs: {
      description: "Ensure Maki object methods have the corret type",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    fixable: "code",
  },
  create: function (context) {
    return {
      MethodDefinition: function (node) {
        const currentObject = getMakiObjectfromClassDeclarationNode(
          node.parent.parent
        );
        if (currentObject == null) {
          return;
        }
        const methods = {};
        currentObject.functions.forEach((func) => {
          methods[func.name.toLowerCase()] = func;
        });

        const methodName = node.key.name;
        // Theoretically this should only be implemented on Object, but it's
        // easier to let each class implement it themselves.
        if (methodName === "getclassname") {
          return;
        }
        if (methodName === "constructor") {
          return;
        }

        // Non-maki methods may be implemented using the `js_` prefix.
        if (methodName.startsWith("js_")) {
          return;
        }

        if (methodName.startsWith("_")) {
          return;
        }

        const func = methods[methodName];
        if (func == null) {
          context.report({
            node: node.key,
            message: `Invalid Maki method name \`${methodName}\``,
          });
          return;
        }

        const { params, returnType, body } = node.value;

        if (returnType == null) {
          const expectedTypeData = getTypeData(func.result);
          if (expectedTypeData != null) {
            context.report({
              node: body,
              message: `Missing return type for Maki method. Expected \`${expectedTypeData.stringRepresentation}\`.`,
              fix: (fixer) => {
                return fixer.insertTextBefore(
                  body,
                  `: ${expectedTypeData.stringRepresentation}`
                );
              },
            });
          }
        } else {
          const expectedTypeData = TYPE_MAP[func.result];
          if (
            expectedTypeData != null &&
            expectedTypeData.typeScriptName !== returnType.typeAnnotation.type
          ) {
            context.report({
              node: returnType,
              message: `Incorrect return type for Maki method. Expected \`${expectedTypeData.stringRepresentation}\`.`,
            });
          }
        }

        func.parameters.forEach(([type, name], i) => {
          const expectedTypeData = TYPE_MAP[type.toLowerCase()];

          const actual = params[i];
          if (actual == null) {
            context.report({
              node: node.value,
              message: `Missing Maki method argument. Expected \`${name}\`.`,
            });
            return;
          }
          if (actual.name !== name) {
            // Turned off since some of the maki names are bad.
            /*
              context.report({
                node: node.value.params[i],
                message: `Invalid Maki method argument name \`${actual}\`. Expected \`${name}\`.`,
              });
              */
          }
          if (expectedTypeData == null) {
            // console.warn(`Missing type data for ${type}.`);
            return;
          }
          const fix = (fixer) => {
            return fixer.replaceText(
              actual,
              `${actual.name}: ${expectedTypeData.stringRepresentation}`
            );
          };
          if (actual.typeAnnotation == null) {
            context.report({
              node: actual,
              message: `Missing type for Maki argument. Expected \`${expectedTypeData.stringRepresentation}\`.`,
              fix,
            });
            return;
          }

          const actualTypeScriptName =
            actual.typeAnnotation.typeAnnotation.type;

          if (actualTypeScriptName !== expectedTypeData.typeScriptName) {
            context.report({
              node: actual,
              message: `Invalid type for Maki argument. Expected \`${expectedTypeData.typeScriptName}\`.`,
              fix,
            });
          }
        });
      },
    };
  },
};
