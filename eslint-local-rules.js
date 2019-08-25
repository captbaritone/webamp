const { objects } = require("./modern/src/maki-interpreter/objects");

const classNameMappings = {
  Object: "MakiObject",
  "@{00000000-0000-0000-0000-000000000000}@": null,
};

function normalizeClassName(className) {
  const normalized = classNameMappings[className];
  return normalized === undefined ? className : normalized;
}

const objectsByName = {};
for (const value of Object.values(objects)) {
  objectsByName[normalizeClassName(value.name)] = value;
}

module.exports = {
  "maki-methods": {
    meta: {
      docs: {
        description: "Ensure Maki objects match std.mi",
        category: "Possible Errors",
        recommended: false,
      },
      schema: [],
      fixable: "code",
    },
    create: function(context) {
      let currentObject = null;
      return {
        "ClassDeclaration:exit": function() {
          currentObject = null;
        },
        ClassDeclaration: function(node) {
          const className = node.id.name;
          // https://github.com/captbaritone/webamp/pull/828#issuecomment-518023519
          if (className.startsWith("Js")) {
            return;
          }
          currentObject = objectsByName[className];
          if (currentObject == null) {
            context.report({
              node: node.id,
              message: `Unknown Maki Class \`${className}\`.`,
            });
            return;
          }
          const expectedParentClassName = normalizeClassName(
            currentObject.parent
          );
          if (expectedParentClassName == null) {
            if (node.superClass !== null) {
              context.report({
                node: node.id,
                message: `Unexpected parent class for \`${className}\`. \`${className}\` should not extend any class.`,
              });
            }
            // This is probably MakiObject which does not inherit from anything
            return;
          }
          const parentClassName = node.superClass.name;
          if (parentClassName !== expectedParentClassName) {
            context.report({
              node: node.superClass,
              message: `Incorrect parent class \`${parentClassName}\`. Expected \`${expectedParentClassName}\`.`,
            });
          }
        },
        ClassBody: function(node) {
          if (currentObject == null) {
            return;
          }

          const implementedMethodNames = new Set(
            node.body
              .filter(prop => prop.type === "MethodDefinition")
              .map(method => method.key.name)
          );

          currentObject.functions.forEach(func => {
            const methodName = func.name.toLowerCase();
            if (implementedMethodNames.has(methodName)) {
              return;
            }
            const args = func.parameters.map(([, name]) => name).join(", ");

            // We rely on Prettier to clean this up.
            // We also expect `unimplementedWarning` to already be imported.
            const methodString = `
              ${methodName}(${args}) {
                unimplementedWarning("${methodName}");
                return;
              }
            `;

            const lastChild = node.body[node.body.length - 1];
            context.report({
              node: node,
              message: `Missing method ${methodName}`,
              fix: fixer => {
                return fixer.insertTextAfter(lastChild, methodString);
              },
            });
          });
        },
        MethodDefinition: function(node) {
          if (currentObject == null) {
            return;
          }
          const methods = {};
          currentObject.functions.forEach(func => {
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
          /*

          const args = node.value.params.map(param => param.name);

          func.parameters.forEach(([, name], i) => {
            const actual = args[i];
            if (actual !== name) {
              context.report({
                node: node.value.params[i],
                message: `Invalid Maki method argument name \`${actual}\`. Expected \`${name}\`.`,
              });
            }
          });
          */
        },
      };
    },
  },
};
