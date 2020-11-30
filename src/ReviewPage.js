import * as Utils from "./utils";
import { API_URL } from "./constants";
import React, { useState, useEffect } from "react";

function warmScreenshotImage(hash) {
  const screenshotUrl = Utils.screenshotUrlFromHash(hash);
  new Image().src = screenshotUrl;
}

function useQueuedSkin() {
  const [queue, setQueue] = useState([]);
  function remove() {
    setQueue((queue) => {
      const newQueue = [...queue];
      newQueue.shift();
      return newQueue;
    });
  }

  useEffect(() => {
    if (queue.length > 10) {
      return;
    }
    let canceled = false;
    fetch(`${API_URL}/to_review?cacheBust=${Math.random()}`, {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 403) {
          window.location = `${API_URL}/auth`;
        }
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        if (canceled) {
          return;
        }
        warmScreenshotImage(response.md5);
        setQueue((queue) => [...queue, response]);
      });

    return () => (canceled = true);
  }, [queue]);
  const skin = queue[0];

  return [skin || null, remove];
}

export default function ReviewPage() {
  const [skin, remove] = useQueuedSkin();
  async function approve() {
    remove();
    const response = await fetch(`${API_URL}/skins/${skin.md5}/approve`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
    if (response.status === 403) {
      window.location = `${API_URL}/auth`;
    }
  }
  async function reject() {
    remove();
    const response = await fetch(`${API_URL}/skins/${skin.md5}/reject`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    if (response.status === 403) {
      window.location = `${API_URL}/auth`;
    }
  }

  useEffect(() => {
    if (skin == null) {
      return;
    }
    function handleKeypress(e) {
      switch (e.key) {
        case "ArrowUp":
          approve();
          break;
        case "ArrowDown":
          reject();
          break;
        default:
        // noop
      }
    }
    document.body.addEventListener("keydown", handleKeypress);
    return () => {
      document.body.removeEventListener("keydown", handleKeypress);
    };
  });
  if (skin == null) {
    return <h2 style={{ color: "white" }}>Loading...</h2>;
  }

  return (
    <div style={{ color: "white" }}>
      <h2>{skin.filename}</h2>
      <img
        style={{ width: "100%", maxWidth: 500, imageRendering: "pixelated" }}
        src={Utils.screenshotUrlFromHash(skin.md5)}
        alt={skin.filename}
      />
      <br />
      <button onClick={approve}>{"👍"} Approve</button>
      <button onClick={reject}>{"👎"} Reject</button>
      <p>Press up arrow to approve or down arrow to reject.</p>
    </div>
  );
}
