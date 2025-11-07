"use client";

import { useState, ReactNode } from "react";
import { Heart, Share2, Flag, Download } from "lucide-react";
import { ClientSkin } from "./SkinScroller";
import { logUserEvent } from "./Events";

type Props = {
  skin: ClientSkin;
  sessionId: string;
};

export default function SkinActionIcons({ skin, sessionId }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        right: "1rem",
        bottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        paddingBottom: "1rem",
      }}
    >
      <LikeButton skin={skin} sessionId={sessionId} />
      <ShareButton skin={skin} sessionId={sessionId} />
      <FlagButton skin={skin} sessionId={sessionId} />
      <DownloadButton skin={skin} sessionId={sessionId} />
    </div>
  );
}

// Implementation details below

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  opacity?: number;
  "aria-label": string;
  children: ReactNode;
};

function Button({
  onClick,
  disabled = false,
  opacity = 1,
  "aria-label": ariaLabel,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        opacity,
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))",
      }}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

type LikeButtonProps = {
  skin: ClientSkin;
  sessionId: string;
};

function LikeButton({ skin, sessionId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(skin.likeCount);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Optimistically update the like count
    setLikeCount((prevCount) =>
      newLikedState ? prevCount + 1 : prevCount - 1
    );

    logUserEvent(sessionId, {
      type: "skin_like",
      skinMd5: skin.md5,
      liked: newLikedState,
    });
  };

  return (
    <Button onClick={handleLike} aria-label="Like">
      <Heart
        size={32}
        color="white"
        fill={isLiked ? "white" : "none"}
        strokeWidth={2}
      />
      {likeCount > 0 && (
        <span
          style={{
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {likeCount}
        </span>
      )}
    </Button>
  );
}

type ShareButtonProps = {
  skin: ClientSkin;
  sessionId: string;
};

function ShareButton({ skin, sessionId }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        logUserEvent(sessionId, {
          type: "share_open",
          skinMd5: skin.md5,
        });

        await navigator.share({
          title: skin.fileName,
          text: `Check out this Winamp skin: ${skin.fileName}`,
          url: skin.shareUrl,
        });

        logUserEvent(sessionId, {
          type: "share_success",
          skinMd5: skin.md5,
        });
      } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
          logUserEvent(sessionId, {
            type: "share_failure",
            skinMd5: skin.md5,
            errorMessage: error.message,
          });
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(skin.shareUrl);

      logUserEvent(sessionId, {
        type: "share_success",
        skinMd5: skin.md5,
      });
      alert("Share link copied to clipboard!");
    }
  };

  return (
    <Button onClick={handleShare} aria-label="Share">
      <Share2 size={32} color="white" strokeWidth={2} />
    </Button>
  );
}

type FlagButtonProps = {
  skin: ClientSkin;
  sessionId: string;
};

function FlagButton({ skin, sessionId }: FlagButtonProps) {
  const [isFlagged, setIsFlagged] = useState(skin.nsfw);

  const handleFlagNsfw = async () => {
    if (isFlagged) return; // Only allow flagging once

    setIsFlagged(true);

    logUserEvent(sessionId, {
      type: "skin_flag_nsfw",
      skinMd5: skin.md5,
    });
  };

  return (
    <Button
      onClick={handleFlagNsfw}
      disabled={isFlagged}
      opacity={isFlagged ? 0.5 : 1}
      aria-label="Flag as NSFW"
    >
      <Flag
        size={32}
        color="white"
        fill={isFlagged ? "white" : "none"}
        strokeWidth={2}
      />
    </Button>
  );
}

type DownloadButtonProps = {
  skin: ClientSkin;
  sessionId: string;
};

function DownloadButton({ skin, sessionId }: DownloadButtonProps) {
  const handleDownload = async () => {
    logUserEvent(sessionId, {
      type: "skin_download",
      skinMd5: skin.md5,
    });

    // Trigger download
    window.location.href = skin.downloadUrl;
  };

  return (
    <Button onClick={handleDownload} aria-label="Download">
      <Download size={32} color="white" strokeWidth={2} />
    </Button>
  );
}
