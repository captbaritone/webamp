const {
  getMakiObjectfromClassDeclarationNode,
  normalizeClassName,
} = require("./maki-eslint-utils");

function isJsMakiNode(node) {
  const className = node.id.name;
  // https://github.com/captbaritone/webamp/pull/828#issuecomment-518023519
  return className.startsWith("Js");
}

module.exports = {
  meta: {
    docs: {
      description: "Ensure Maki Classes match std.mi",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    fixable: "code",
  },
  create: function (context) {
    return {
      ClassDeclaration: function (node) {
        const className = node.id.name;
        if (isJsMakiNode(node)) {
          return;
        }
        const currentObject = getMakiObjectfromClassDeclarationNode(node);
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
    };
  },
};
