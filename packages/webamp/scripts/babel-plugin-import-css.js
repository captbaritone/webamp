const path = require("path");
const fs = require("fs");
const CleanCSS = require("clean-css");

module.exports = function ({ types: t }) {
  const cleanCss = new CleanCSS({});
  return {
    manipulateOptions(options) {
      return options;
    },

    visitor: {
      ImportDeclaration: {
        exit: (babelInfo, { file }) => {
          const { node } = babelInfo;
          const importPath = node.source.value;
          if (!importPath.endsWith(".css")) {
            return;
          }
          if (!importPath.startsWith(".")) {
            throw new Error(
              "Cannot inline .css files that do not use relative paths"
            );
          }
          const cssPath = require.resolve(importPath, {
            paths: [path.dirname(file.opts.filename)],
          });

          const css = fs.readFileSync(cssPath, { encoding: "utf8" });
          const { styles: minifiedCss, errors } = cleanCss.minify(css);
          if (errors.length) {
            throw new Error(errors);
          }

          const cssTemplateLiteral = t.stringLiteral(minifiedCss);

          babelInfo.replaceWith(
            t.callExpression(
              t.callExpression(t.identifier("require"), [
                t.stringLiteral("load-styles"),
              ]),
              [cssTemplateLiteral]
            )
          );
        },
      },
    },
  };
};
