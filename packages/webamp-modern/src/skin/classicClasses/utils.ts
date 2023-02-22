import { DEFAULT_SKIN } from "./constants";

export const parseViscolors = (text: string): string[] => {
  const entries = text.split("\n");
  const regex = /^\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/;
  const colors = [...DEFAULT_SKIN.colors];
  entries
    .map((line) => regex.exec(line))
    .filter(Boolean)
    .map((matches) => (matches as RegExpExecArray).slice(1, 4).join(","))
    .map((rgb, i) => {
      colors[i] = `rgb(${rgb})`;
    });
  return colors;
};

interface IniData {
  [section: string]: {
    [key: string]: string;
  };
}

const SECTION_REGEX = /^\s*\[(.+?)\]\s*$/;
const PROPERTY_REGEX = /^\s*([^;][^=]*)\s*=\s*(.*)\s*$/;

export const parseIni = (text: string): IniData => {
  let section: string, match;
  return text.split(/[\r\n]+/g).reduce((data: IniData, line) => {
    if ((match = line.match(PROPERTY_REGEX)) && section != null) {
      const key = match[1].trim().toLowerCase();
      const value = match[2]
        // Ignore anything after a second `=`
        // TODO: What if this is inside quotes or escaped?
        .replace(/\=.*$/g, "")
        .trim()
        // Strip quotes
        // TODO: What about escaped quotes?
        // TODO: What about unbalanced quotes?
        .replace(/(^")|("$)|(^')|('$)/g, "");
      data[section][key] = value;
    } else if ((match = line.match(SECTION_REGEX))) {
      section = match[1].trim().toLowerCase();
      data[section] = {};
    }
    return data;
  }, {});
};
