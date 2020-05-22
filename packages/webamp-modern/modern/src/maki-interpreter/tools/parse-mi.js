#!/usr/bin/env node

/**
 * Based on extract_objects.pl from Ralf Engels<ralf.engels@gmx.de> Maki decompiler
 */

const fs = require("fs");

function parseFile(filePath) {
  const mi = fs.readFileSync(filePath, "utf8");
  const lines = mi.split("\n");

  const objects = {};
  lines.forEach((line, lineNumber) => {
    const classDefinitionMatch = /\s*extern\s+class\s*\@\{(........\s?-\s?....\s?-\s?....\s?-\s?....\s?-\s?............)\}\s*\@\s*(.*?)\s+(.*?);/.exec(
      line
    );
    if (classDefinitionMatch) {
      const id = classDefinitionMatch[1].replace(/[-\s]/g, "");
      const parent = classDefinitionMatch[2];
      const name = classDefinitionMatch[3]
        .replace(/^_predecl /, "")
        .replace(/^&/, "");
      objects[name.toLowerCase()] = { id, name, parent, functions: [] };
    }

    const methodMatch = /\s*extern(\s+.*)?\s+(.*)\.(.*)\((.*)\);/.exec(line);

    if (methodMatch) {
      const result = methodMatch[1] == null ? "" : methodMatch[1].trim();
      const className = methodMatch[2].toLowerCase();
      const name = methodMatch[3].trim();
      const rawArgs = methodMatch[4].split(/\s*,\s*/);
      const parameters = rawArgs.filter(Boolean).map((rawArg) => {
        const argMatch = /^\s*(.*\s+)?(.*)\s*/.exec(rawArg);
        if (argMatch == null) {
          throw new Error(`Could not find args in ${rawArg} in ${line}`);
        }
        const type = argMatch[1];
        if (type == null) {
          // console.warn(`Could not find args name in ${fileName}:${lineNum} "${line}"`);
          return [argMatch[2], "unknown_arg_name"];
        }
        return [type.trim(), argMatch[2]];
      });
      if (objects[className] == null) {
        throw new Error(
          `"${className} not defined in ${filePath}:${lineNumber}. I have ${JSON.stringify(
            Object.keys(objects)
          )}`
        );
      }
      objects[className].functions.push({ result, name, parameters });
    }
  });

  const objectIds = {};
  Object.keys(objects).forEach((normalizedName) => {
    const { id, parent, functions, name } = objects[normalizedName];
    objectIds[id] = { parent, functions, name };
  });

  return objectIds;
}

module.exports = { parseFile };
