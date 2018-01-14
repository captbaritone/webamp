import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { skinUrl } from "./config";
import { genArrayBufferFromUrl } from "./fileUtils";
import skinParser from "./skinParser";

const SkinTable = props => (
  <table>
    {Object.keys(props.images)
      .sort()
      .map(key => (
        <tr>
          <td>{key}</td>
          <td>
            <img src={props.images[key]} />
          </td>
        </tr>
      ))}
  </table>
);

const parse = async () => {
  const skinData = await skinParser(await genArrayBufferFromUrl(skinUrl));
  render(<SkinTable {...skinData} />, document.getElementById("skin"));
};

parse();
