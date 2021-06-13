import Group from "./Group";

type ParsedMaki = Object; // Not typed yet.

export default class SystemObject {
  _parentGroup: Group;
  _parsedScript: ParsedMaki;

  constructor(parsedScript: ParsedMaki) {
    this._parsedScript = parsedScript;
  }

  setParentGroup(group: Group) {
    this._parentGroup = group;
  }
}
