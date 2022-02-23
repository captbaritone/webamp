import * as React from "react";
import { gql } from "./utils";
import { useQuery, useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";

const query = gql`
  query DebugSkin($md5: String!) {
    fetch_skin_by_md5(md5: $md5) {
      filename
      screenshot_url
      webamp_url
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
  const data = useQuery(query, variables);
  const toggleDebugView = useActionCreator(Actions.toggleDebugView);
  if (data == null) {
    return <h1>Loading...</h1>;
  }
  const skin = data.fetch_skin_by_md5;

  return (
    <div style={{ backgroundColor: "white", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "row", padding: 20 }}>
        <div style={{ flexGrow: 1 }}>
          <h1>
            {" "}
            {skin.filename} {skin.nsfw && "🔞"}
          </h1>
          <h2>Links</h2>
          <ul>
            <li>
              <a href={skin.screenshot_url}>Screenshot</a>
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
          <ul>
            {skin.tweets.map((tweet, i) => (
              <li key={tweet.url}>
                <a href={tweet.url}>Tweet</a> ({tweet.retweets} retweets /{" "}
                {tweet.likes} likes)
              </li>
            ))}
          </ul>
          <h2>Reviews</h2>
          <ul>
            {skin.reviews.map((review, i) => (
              <li key={i}>
                {review.rating} by {review.reviewer ?? "[unknown]"}
              </li>
            ))}
          </ul>
          <h2>Files</h2>
          <table>
            <tbody>
              {skin.archive_files.map((file) => {
                return (
                  <tr key={file.filename}>
                    <td>
                      <a href={file.url}>{file.filename}</a>
                    </td>
                    <td>{formatBytes(file.size)}</td>
                    <td>
                      {new Date(Date.parse(file.date)).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Readme</h2>
          <pre style={{ whiteSpace: "pre-line", maxWidth: 600 }}>
            {skin.readme_text}
          </pre>
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleDebugView();
              }}
            >
              [close]
            </button>
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
        </div>
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
