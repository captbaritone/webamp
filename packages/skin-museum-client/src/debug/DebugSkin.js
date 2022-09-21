import * as React from "react";
import { gql } from "../utils";
import { useQuery, useActionCreator } from "../hooks";
import * as Actions from "../redux/actionCreators";
import { DebugFile } from "./DebugFile";

const query = gql`
  query DebugSkin($md5: String!) {
    fetch_skin_by_md5(md5: $md5) {
      filename
      download_url
      screenshot_url
      webamp_url
      museum_url
      nsfw
      readme_text
      tweets {
        likes
        url
        retweets
      }
      internet_archive_item {
        identifier
        url
      }
      archive_files {
        is_directory
        url
        file_md5
        filename
        size
        text_content
        date
      }
      reviews {
        rating
        reviewer
      }
    }
  }
`;

export default function DebugSkin({ md5 }) {
  const variables = React.useMemo(() => ({ md5 }), [md5]);

  const [file, setFile] = React.useState(null);
  const data = useQuery(query, variables);
  const toggleDebugView = useActionCreator(Actions.toggleDebugView);
  if (data == null) {
    return <h1>Loading...</h1>;
  }
  const skin = data.fetch_skin_by_md5;

  const screenshotFile = {
    filename: skin.filename + ".png",
    url: skin.screenshot_url,
  };
  const focusedFile = file || screenshotFile;

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "row", padding: 20 }}>
        <div style={{ paddingRight: 20 }}>
          <button
            style={{ height: "inherit" }}
            onClick={(e) => {
              e.preventDefault();
              toggleDebugView();
            }}
          >
            [close]
          </button>
          <br />
          <h1>
            {" "}
            {skin.filename} {skin.nsfw && "🔞"}
          </h1>
          <h2>Links</h2>
          <ul>
            <li>
              <a href={skin.museum_url}>Museum Link</a>
            </li>
            <li>
              <a href={skin.download_url}>Download</a>
            </li>
            <li>
              <a href={skin.screenshot_url}>Screenshot</a>{" "}
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(screenshotFile);
                }}
              >
                {"🔎"}
              </a>
            </li>
            <li>
              <a href={skin.webamp_url}>Webamp</a>
            </li>
            {skin.internet_archive_item && (
              <li>
                <a href={skin.internet_archive_item.url}>Internet Archive</a>
              </li>
            )}
          </ul>
          <h2>Shares</h2>
          {skin.tweets.length === 0 ? (
            <p>No Tweets</p>
          ) : (
            <ul>
              {skin.tweets.map((tweet, i) => (
                <li key={tweet.url}>
                  <a href={tweet.url}>Tweet</a> ({tweet.retweets} retweets /{" "}
                  {tweet.likes} likes)
                </li>
              ))}
            </ul>
          )}
          <h2>Reviews</h2>
          {skin.reviews.length === 0 ? (
            <p>No reviews</p>
          ) : (
            <ul>
              {skin.reviews.map((review, i) => (
                <li key={i}>
                  {review.rating} by {review.reviewer ?? "[unknown]"}
                </li>
              ))}
            </ul>
          )}
          <h2>Files</h2>
          <table>
            <tbody>
              <tr>
                <th style={{ textAlign: "left" }}>File Path</th>
                <th style={{ textAlign: "left" }}>Size</th>
                <th style={{ textAlign: "left" }}>Date</th>
              </tr>
              {skin.archive_files.map((file) => {
                return (
                  <tr key={file.filename}>
                    <td>
                      <a
                        href={file.url}
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(file);
                        }}
                      >
                        {file.filename}
                      </a>
                    </td>
                    <td>
                      {file.is_directory ? "N/A" : formatBytes(file.size)}
                    </td>
                    <td>
                      {file.is_directory
                        ? "N/A"
                        : new Date(Date.parse(file.date)).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          {focusedFile && <DebugFile file={focusedFile} />}
          {/*<h2>Readme</h2>
          <pre style={{ whiteSpace: "pre-line", maxWidth: 600 }}>
            {skin.readme_text}
          </pre>*/}
        </div>
        {/*<div style={{ flexGrow: 1 }}>
          <div style={{ textAlign: "right", marginBottom: 20 }}>
          </div>
          <img
            alt={`Screenshot of a Winamps skin named "${skin.filename}"`}
            style={{
              transformOrigin: "top left",
              transform: "scale(2)",
              imageRendering: "pixelated",
            }}
            src={skin.screenshot_url}
          />
        </div>*/}
      </div>
    </div>
  );
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
