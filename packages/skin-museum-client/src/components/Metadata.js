import React, { useEffect, useState } from "react";
import DownloadLink from "./DownloadLink";
import * as Utils from "../utils";
import LinkInput from "./LinkInput";
// import { API_URL } from "../constants";
// import * as Actions from "../redux/actionCreators";
import * as Selectors from "../redux/selectors";
import * as Actions from "../redux/actionCreators";
import { useSelector } from "react-redux";
// import { useActionCreator } from "../hooks";
import DownloadText from "./DownloadText";
import { useActionCreator } from "../hooks";

function Metadata() {
  const hash = useSelector(Selectors.getSelectedSkinHash);
  const skinData = useSelector((state) => state.skins[hash] || null);
  const fileName = skinData && skinData.fileName;

  const permalink = useSelector(
    Selectors.getAbsolutePermalinkUrlFromHashGetter
  )(hash);
  // const toggleFileExplorer = useActionCreator(Actions.toggleFileExplorer);
  const focusedSkinFile = useSelector(Selectors.getFocusedSkinFile);
  const markNsfw = useActionCreator(Actions.markNsfw);
  const toggleDebug = useActionCreator(Actions.toggleDebugView);
  const [showLink, setShowLink] = useState(false);
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "d") {
        toggleDebug();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleDebug]);
  // TODO: Move to Epic
  async function report(e) {
    e.preventDefault();
    markNsfw(hash);
  }

  let readmeLink = null;
  if (
    focusedSkinFile != null &&
    focusedSkinFile.content != null &&
    focusedSkinFile.fileName != null
  ) {
    readmeLink = (
      <DownloadText
        id="metadata-download-reame"
        text={focusedSkinFile.content}
        download={focusedSkinFile.fileName}
      >
        Readme
      </DownloadText>
    );
  }

  const elements = [
    <DownloadLink
      id="metadata-download-skin"
      href={Utils.skinUrlFromHash(hash)}
      download={fileName}
    >
      Download
    </DownloadLink>,
    readmeLink,
    /*
    <button
      onClick={(e) => {
        // The UI for this is not good yet
        toggleFileExplorer();
        e.preventDefault();
      }}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        textDecoration: "underline",
        cursor: "pointer",
        margin: 0,
      }}
    >
      Readme
    </button>,
    */
    <a
      href={permalink}
      id="metadata-share"
      onClick={(e) => {
        setShowLink((s) => !s);
        e.preventDefault();
      }}
    >
      Share
    </a>,
    /*
    <a
      id="metadata-webamp"
      href={`https://webamp.org?skinUrl=${Utils.skinUrlFromHash(hash)}`}
      target="_new"
    >
      Webamp
    </a>, */
    skinData && skinData.nsfw ? (
      "NSFW"
    ) : (
      <button
        id="metadata-nsfw"
        onClick={report}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          textDecoration: "underline",
          cursor: "pointer",
          margin: 0,
        }}
      >
        Report as NSFW
      </button>
    ),
  ].filter(Boolean);
  return (
    <div className="metadata">
      {showLink && (
        <LinkInput permalink={permalink} hide={() => setShowLink(false)} />
      )}
      {fileName || "Filename loading..."}{" "}
      {elements.map((element, i) => {
        const last = i === element.length - 1;
        return (
          <span style={{ whiteSpace: "nowrap" }} key={i}>
            {"["}
            {element}
            {"]"}
            {last ? "" : " "}
          </span>
        );
      })}
    </div>
  );
}

export default Metadata;
