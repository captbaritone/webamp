import React, { useState, useEffect } from "react";

// The `download` attribute on `<a>` tags is not respected on cross origin
// assets. However, it does work for Object URLs. So, we download the skin as
// soon as we show the link and swap out the href with the Object URL as soon as
// it's loaded. The skin should already be cached, so it should not actually
// result in an extra network request.
//
// There may be a brief time where the download link will use the hash name instead
// of the real name, but it's probably too short to actually ever be hit by a real user.

interface DownloadLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const DownloadLink: React.FC<DownloadLinkProps> = ({
  href: originalHref,
  children,
  ...props
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchAndCreateObjectUrl = async (href: string) => {
      try {
        const response = await fetch(href);
        const blob = await response.blob();

        if (!isCancelled) {
          const url = URL.createObjectURL(blob);
          setObjectUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch and create object URL:", error);
      }
    };

    fetchAndCreateObjectUrl(originalHref);

    return () => {
      isCancelled = true;
    };
  }, [originalHref]);

  // Separate effect to clean up object URLs when they change or component unmounts
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return (
    <a {...props} href={objectUrl || originalHref}>
      {children}
    </a>
  );
};

export default DownloadLink;
