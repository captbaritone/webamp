import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { skinUrl } from "./config";
import MyFile from "./myFile";
import skinParser from "./skinParser";

const skinFile = new MyFile();
skinFile.setUrl(skinUrl);

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
  const skinData = await skinParser(skinFile);
  render(<SkinTable {...skinData} />, document.getElementById("skin"));
};

parse();
