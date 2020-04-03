import React, { useState } from "react";
import DownloadLink from "./DownloadLink";
import * as Utils from "../utils";
import LinkInput from "./LinkInput";

function Metadata({ permalink, openFileExplorer, fileName, hash }) {
  const [showLink, setShowLink] = useState(false);
  const elements = [
    <DownloadLink href={Utils.skinUrlFromHash(hash)} download={fileName}>
      Download
    </DownloadLink>,
    <a
      href={"#"}
      onClick={e => {
        openFileExplorer();
        e.preventDefault();
      }}
    >
      Readme
    </a>,
    <a
      href={permalink}
      onClick={e => {
        setShowLink(s => !s);
        e.preventDefault();
      }}
    >
      Share
    </a>,
    <a
      href={`https://webamp.org?skinUrl=${Utils.skinUrlFromHash(hash)}`}
      target="_new"
    >
      Webamp
    </a>
  ];
  return (
    <div className="metadata">
      {showLink && (
        <LinkInput permalink={permalink} hide={() => setShowLink(false)} />
      )}
      {fileName || "Filename loading..."}{" "}
      {elements.map((element, i) => {
        const last = i === element.length - 1;
        return (
          <>
            {"["}
            {element}
            {"]"}
            {last ? "" : " "}
          </>
        );
      })}
    </div>
  );
}

export default Metadata;
