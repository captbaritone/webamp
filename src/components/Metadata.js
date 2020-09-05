import React, { useState } from "react";
import DownloadLink from "./DownloadLink";
import * as Utils from "../utils";
import LinkInput from "./LinkInput";

function Metadata({ permalink, openFileExplorer, fileName, hash }) {
  const [showLink, setShowLink] = useState(false);
  async function report(e) {
    e.preventDefault();
    try {
      await fetch(`https://api.webamp.org/skins/${hash}/report`, {
        method: "POST",
        mode: "cors",
      });
    } catch (e) {
      alert("Oops. Something went wrong. Please try again later.");
      return;
    }
    alert("Thanks for reporting. We'll review this skin.");
  }

  const elements = [
    <DownloadLink href={Utils.skinUrlFromHash(hash)} download={fileName}>
      Download
    </DownloadLink>,
    /*
    <a
      href={"#"}
      onClick={(e) => {
        openFileExplorer();
        e.preventDefault();
      }}
    >
      Readme
    </a>,
    */
    <a
      href={permalink}
      onClick={(e) => {
        setShowLink((s) => !s);
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
    </a>,
    <a href="#" onClick={report}>
      Report as NSFW
    </a>,
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
          <React.Fragment key={i}>
            {"["}
            {element}
            {"]"}
            {last ? "" : " "}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Metadata;
