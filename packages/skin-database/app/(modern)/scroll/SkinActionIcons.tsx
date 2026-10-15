"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { Heart, Share2, Flag, Download, Check } from "lucide-react";
import { ClientSkin } from "./SkinScroller";
import { useEventLogger } from "./eventLogger";
import { fetchGraphql } from "./graphql";

type Props = {
  skin: ClientSkin;
};

export default function SkinActionIcons({ skin }: Props) {
  return (
    // Laid out in scroll.css: a row under the skin on mobile, a column beside
    // it on desktop.
    <div className="skin-action-icons">
      <LikeButton skin={skin} />
      <ShareButton skin={skin} />
      <FlagButton skin={skin} />
      <DownloadButton skin={skin} />
    </div>
  );
}

// Implementation details below

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
  children: ReactNode;
};

function Button({
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="skin-action-button"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {children}
    </button>
  );
}

// Compact counts like "2.9k" or "20.6k" keep the label short under the icon.
// A fixed locale so the server-rendered text matches the client's.
const LIKE_COUNT_FORMAT = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatLikeCount(count: number): string {
  // Intl uses "K"; we prefer lowercase for thousands.
  return LIKE_COUNT_FORMAT.format(count).replace(/K$/, "k");
}

type LikeButtonProps = {
  skin: ClientSkin;
};

function LikeButton({ skin }: LikeButtonProps) {
  const logger = useEventLogger();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(skin.likeCount);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Optimistically update the like count
    setLikeCount((prevCount) =>
      newLikedState ? prevCount + 1 : prevCount - 1
    );

    logger.log({
      type: "skin_like",
      skinMd5: skin.md5,
      liked: newLikedState,
    });
  };

  return (
    <Button onClick={handleLike} aria-label={isLiked ? "Unlike" : "Like"}>
      <Heart
        size={32}
        color="white"
        fill={isLiked ? "white" : "none"}
        strokeWidth={2}
      />
      {likeCount > 0 && (
        <span className="skin-like-count">{formatLikeCount(likeCount)}</span>
      )}
    </Button>
  );
}

type ShareButtonProps = {
  skin: ClientSkin;
};

const COPY_STATUS_TEXT = {
  idle: { label: "Share link", status: "" },
  copied: { label: "Link copied", status: "Copied" },
  failed: { label: "Couldn't copy link", status: "Couldn't copy" },
};

// Only touch devices get the native share sheet. On desktop it's a clunky
// modal, so there we just copy the link.
function shouldUseShareSheet(): boolean {
  return (
    typeof navigator.share === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function ShareButton({ skin }: ShareButtonProps) {
  const logger = useEventLogger();
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | null>(
    null
  );
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) clearTimeout(resetTimerRef.current);
    };
  }, []);

  function showCopyStatus(status: "copied" | "failed") {
    setCopyStatus(status);
    if (resetTimerRef.current != null) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopyStatus(null), 2000);
  }

  const handleShare = async () => {
    logger.log({
      type: "share_open",
      skinMd5: skin.md5,
    });

    if (shouldUseShareSheet()) {
      try {
        await navigator.share({
          title: skin.fileName,
          text: `Check out this Winamp skin: ${skin.fileName}`,
          url: skin.shareUrl,
        });

        logger.log({
          type: "share_success",
          skinMd5: skin.md5,
        });
      } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
          logger.log({
            type: "share_failure",
            skinMd5: skin.md5,
            errorMessage: error.message,
          });
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(skin.shareUrl);
      showCopyStatus("copied");
      logger.log({
        type: "share_success",
        skinMd5: skin.md5,
      });
    } catch (error) {
      console.error("Copy failed:", error);
      showCopyStatus("failed");
      logger.log({
        type: "share_failure",
        skinMd5: skin.md5,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const { label, status } = COPY_STATUS_TEXT[copyStatus ?? "idle"];

  return (
    <Button onClick={handleShare} aria-label={label}>
      {copyStatus === "copied" ? (
        <Check size={32} color="white" strokeWidth={2} />
      ) : (
        <Share2 size={32} color="white" strokeWidth={2} />
      )}
      <span className="skin-action-status" role="status">
        {status}
      </span>
    </Button>
  );
}

type FlagButtonProps = {
  skin: ClientSkin;
};

function FlagButton({ skin }: FlagButtonProps) {
  const logger = useEventLogger();
  const [isFlagged, setIsFlagged] = useState(skin.nsfw);

  const handleFlagNsfw = async () => {
    if (isFlagged) return; // Only allow flagging once

    setIsFlagged(true);

    logger.log({
      type: "skin_flag_nsfw",
      skinMd5: skin.md5,
    });

    // Same as the legacy site: ask a human to review it in Discord.
    try {
      await fetchGraphql(
        `mutation ReportSkin($md5: String!) {
          request_nsfw_review_for_skin(md5: $md5)
        }`,
        { md5: skin.md5 }
      );
    } catch (error) {
      console.error("Failed to report skin", error);
      setIsFlagged(false);
    }
  };

  return (
    <Button
      onClick={handleFlagNsfw}
      disabled={isFlagged}
      aria-label={isFlagged ? "Reported as NSFW" : "Report as NSFW"}
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
};

function DownloadButton({ skin }: DownloadButtonProps) {
  const logger = useEventLogger();
  const handleDownload = async () => {
    logger.log({
      type: "skin_download",
      skinMd5: skin.md5,
    });

    // Trigger download
    window.location.href = skin.downloadUrl;
  };

  return (
    <Button onClick={handleDownload} aria-label="Download skin">
      <Download size={32} color="white" strokeWidth={2} />
    </Button>
  );
}
