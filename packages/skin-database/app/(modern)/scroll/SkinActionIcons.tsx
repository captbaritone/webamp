"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { Share2, Flag, Download, Check } from "lucide-react";
import { ClientSkin } from "./gridSkin";
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

// Browsers ignore a link's `download` file name for files from another origin
// (the skins' storage), so the skin would be saved under its md5. They respect
// it for an object URL, so fetch the file (already cached, as Webamp loaded
// it) and save that. The same trick as the classic UI's DownloadLink.
async function downloadAs(url: string, fileName: string): Promise<void> {
  let objectUrl: string;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    objectUrl = URL.createObjectURL(await response.blob());
  } catch (error) {
    console.error("Failed to fetch the skin to download:", error);
    // Saved under its md5, but saved.
    window.location.href = url;
    return;
  }
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Long enough for the browser to start saving it.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
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

    await downloadAs(skin.downloadUrl, skin.fileName);
  };

  return (
    <Button onClick={handleDownload} aria-label="Download skin">
      <Download size={32} color="white" strokeWidth={2} />
    </Button>
  );
}
