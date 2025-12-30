"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import StaticPage, {
  Heading,
  Paragraph,
  Label,
  Input,
  Textarea,
  Button,
} from "../StaticPage";

async function sendFeedback(variables: {
  message: string;
  email: string;
  url: string;
}) {
  const mutation = `
    mutation GiveFeedback($message: String!, $email: String, $url: String) {
      send_feedback(message: $message, email: $email, url: $url)
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send feedback");
  }

  return response.json();
}

export default function FeedbackPage() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = useCallback(async () => {
    if (message.trim().length === 0) {
      alert("Please add a message before sending.");
      return;
    }
    const body = {
      message,
      email,
      url: "https://skins.webamp.org" + pathname,
    };
    setSending(true);
    try {
      await sendFeedback(body);
      setSent(true);
    } catch (error) {
      alert("Failed to send feedback. Please try again.");
      setSending(false);
    }
  }, [message, email, pathname]);

  if (sent) {
    return (
      <StaticPage>
        <Heading>Sent!</Heading>
        <Paragraph>
          Thanks for your feedback. I appreciate you taking the time to share
          your thoughts.
        </Paragraph>
      </StaticPage>
    );
  }

  return (
    <StaticPage>
      <Heading>Feedback</Heading>
      <p style={{ marginBottom: "1.5rem" }}>
        Let me know what you think about the Winamp Skin Museum. Bug reports,
        feature suggestions, personal anecdotes, or criticism are all welcome.
      </p>
      <div style={{ marginBottom: "1.5rem" }}>
        <Label>Message</Label>
        <Textarea
          disabled={sending}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ minHeight: 150 }}
          placeholder="Your thoughts here..."
        />
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Label>Email (optional)</Label>
        <Input
          disabled={sending}
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />
      </div>

      <div style={{ textAlign: "right" }}>
        <Button onClick={send} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </StaticPage>
  );
}
