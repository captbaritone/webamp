import std from "./std.json";

const NAME_TO_DEF = {};

Object.values(std).forEach((value) => {
  NAME_TO_DEF[value.name] = value;
});

function getMethod(className, methodName) {
  return NAME_TO_DEF[className].functions.find(({ name }) => {
    return name === methodName;
  });
}

// Between myself and the author of the decompiler, a number of manual tweaks
// have been made to our current object definitions. This function recreates
// those tweaks so we can have an apples to apples comparison.

/*
 * From object.js
 *
 * > The std.mi has this set as void, but we checked in Winamp and confirmed it
 * > returns 0/1
 */
getMethod("Timer", "isRunning").result = "boolean";

/*
 * From Object.pm
 *
 * > note, std.mi does not have this parameter!
 */
getMethod("ToggleButton", "onToggle").parameters[0][1] = "onoff";

// Some methods are not compatible with the type signature of their parent class
getMethod("GuiTree", "onChar").parameters[0][0] = "string";
getMethod("GuiList", "onSetVisible").parameters[0][0] = "boolean";

// I'm not sure how to get these to match
getMethod("Wac", "onNotify").parameters = getMethod(
  "Object",
  "onNotify"
).parameters;
getMethod("Wac", "onNotify").result = "int";

/*

Here's the error we get without that patch:

__generated__/makiInterfaces.ts:254:18 - error TS2430: Interface 'Wac' incorrectly extends interface 'MakiObject'.
  Types of property 'onnotify' are incompatible.
    Type '(notifstr: string, a: number, b: number) => void' is not assignable to type '(command: string, param: string, a: number, b: number) => number'.
      Types of parameters 'a' and 'param' are incompatible.
        Type 'string' is not assignable to type 'number'.

254 export interface Wac extends MakiObject {
                     ~~~


Found 1 error.

 */

export default std;
