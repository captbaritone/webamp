import React, { useLayoutEffect, useState } from "react";

function DownloadText({ text, children, ...restProps }) {
  const [url, setUrl] = useState(null);
  useLayoutEffect(() => {
    var blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    setUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [text]);

  return (
    <a {...restProps} href={url}>
      {/* We have to explicitly set the children to make ESLint happy */}
      {children}
    </a>
  );
}

export default DownloadText;
