import * as Utils from "./utils";
import TinderCard from "react-tinder-card";
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

  return [queue, remove];
}

export default function ReviewPage() {
  const [skins, remove] = useQueuedSkin();
  async function approve(skin) {
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
  async function reject(skin) {
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

  async function nsfw(skin) {
    remove();
    const response = await fetch(`${API_URL}/skins/${skin.md5}/nsfw`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    if (response.status === 403) {
      window.location = `${API_URL}/auth`;
    }
  }

  useEffect(() => {
    if (skins.lenght === 0) {
      return;
    }
    function handleKeypress(e) {
      switch (e.key) {
        case "ArrowUp":
          approve(skins[0]);
          break;
        case "ArrowDown":
          reject(skins[0]);
          break;
        case "n":
        case "N":
          nsfw(skins[0]);
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

  function swiped(dir, skin) {
    switch (dir) {
      case "left":
        reject(skin);
        break;
      case "right":
        approve(skin);
        break;
      default:
    }
    console.log({ dir, skin });
  }

  function outOfFrame(skin) {
    console.log("out of frame", { skin });
  }
  if (skins.length === 0) {
    return <h2 style={{ color: "white" }}>Loading...</h2>;
  }

  const reverseSkins = [...skins].reverse();

  return (
    <div style={{ color: "white", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 500, position: "relative" }}>
        <h2>{skins[0].filename}</h2>
        <div style={{ height: 20 }}>
          <button onClick={() => approve(skins[0])}>{"👍"} Approve</button>
          <button onClick={() => reject(skins[0])}>{"👎"} Reject</button>
          <button onClick={() => nsfw(skins[0])}>{"🔞"} NSFW</button>
        </div>
        <p>
          Press up arrow to approve, down arrow to reject or "n" to mark as
          NSFW.
        </p>
        {reverseSkins.map((skin) => {
          return (
            <TinderCard
              className="tinder-card"
              key={skin.md5}
              onSwipe={(dir) => swiped(dir, skin)}
              onCardLeftScreen={() => outOfFrame(skin)}
              preventSwipe={["up", "down"]}
            >
              <img
                style={{
                  width: "100%",
                  imageRendering: "pixelated",
                }}
                src={Utils.screenshotUrlFromHash(skin.md5)}
                alt={skin.filename}
              />
            </TinderCard>
          );
        })}
        <br />
      </div>
    </div>
  );
}
