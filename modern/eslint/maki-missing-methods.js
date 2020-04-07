const {
  getMakiObjectfromClassDeclarationNode,
} = require("./maki-eslint-utils");

module.exports = {
  meta: {
    docs: {
      description: "Ensure Maki objects match std.mi",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    fixable: "code",
  },
  create: function (context) {
    return {
      ClassBody: function (node) {
        const currentObject = getMakiObjectfromClassDeclarationNode(
          node.parent
        );
        if (currentObject == null) {
          return;
        }

        const implementedMethodNames = new Set(
          node.body
            .filter((prop) => prop.type === "MethodDefinition")
            .map((method) => method.key.name)
        );

        currentObject.functions.forEach((func) => {
          const methodName = func.name.toLowerCase();
          if (implementedMethodNames.has(methodName)) {
            return;
          }
          const args = func.parameters.map(([, name]) => name).join(", ");

          // We rely on Prettier to clean this up.
          // We also expect `unimplementedWarning` to already be imported.
          const methodString = `
              ${methodName}(${args}) {
                return unimplementedWarning("${methodName}");
              }
            `;

          const lastChild = node.body[node.body.length - 1];
          context.report({
            node: node,
            message: `Missing method ${methodName}`,
            fix: (fixer) => {
              return fixer.insertTextAfter(lastChild, methodString);
            },
          });
        });
      },
    };
  },
};
