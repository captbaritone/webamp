import React, { useState } from "react";
import { API_URL } from "./constants";
import { getUrl } from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { useActionCreator } from "./hooks";

import { useCallback } from "react";
import { useSelector } from "react-redux";

export default function Feedback() {
  const close = useActionCreator(Actions.closeFeedbackForm);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const url = useSelector(getUrl);
  const send = useCallback(async () => {
    const body = { message, email, url: "https://skins/webamp.org" + url };
    if (message.trim().length === 0) {
      alert("Please add a message before sending.");
      return;
    }
    setSending(true);
    await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSent(true);
  }, [message, email, url]);

  if (sent) {
    return (
      <div className="static-content">
        <h1>Sent!</h1>
        <p>
          Thanks for your feedback. I appreciate you taking the time to share
          your thoughts.
        </p>
        <div style={{ height: 25, textAlign: "right" }}>
          <button onClick={close} style={{ marginRight: 0 }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="static-content">
      <h1>Feedback</h1>
      <p>
        Let me know what you think about the Winamp Skin Museum. Bug reports,
        feature suggestions, personal anecdotes, or criticism are all welcome.
      </p>
      <p>
        <label>
          Message
          <textarea
            disabled={sending}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ display: "block", width: "100%", minHeight: 150 }}
            placeholder="Your thoughts here..."
          />
        </label>
      </p>
      <p>
        <label>
          Email (optional)
          <input
            disabled={sending}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            style={{ width: "100%" }}
          />
        </label>
      </p>

      <p>
        <div style={{ height: 25, textAlign: "right" }}>
          <button onClick={send} style={{ marginRight: 0 }} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </p>
    </div>
  );
}
