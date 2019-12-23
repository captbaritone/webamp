const std = require("./std.json");

// Between myself and the author of the decompiler, a number of manual tweaks
// have been made to our current object definitions. This function recreates
// those tweaks so we can have an apples to apples comparison.

/*
 * From object.js
 *
 * > The std.mi has this set as void, but we checked in Winamp and confirmed it
 * > returns 0/1
 */
std["5D0C5BB67DE14b1fA70F8D1659941941"].functions[5].result = "boolean";

/*
 * From Object.pm
 *
 * > note, std.mi does not have this parameter!
 */
std.B4DCCFFF81FE4bcc961B720FD5BE0FFF.functions[0].parameters[0][1] = "onoff";

module.exports = std;
