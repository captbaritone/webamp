import React, { useState, useEffect } from "react";

// When the user is scrolling quickly, we can render a ton of images. So many
// that we saturate the number of concurrent network requests that the browser
// will allow.
//
// With a naive implement, this leads to images that are in the viewport being
// blocked because images that we've scrolled past are still in the queue to
// download. By removing the `src` attribute, we signal to the browser that the
// request can be canceled.
//
// Another approach I tried was issuing a `fetch` request for the image with an
// `AbortController` to allow canceling on unmount, and only adding the `src` to
// the image _after_ the `fetch` completed. The ideas was that the `<img>` would
// end up loading the image from the cache which was warmed by `fetch`. However,
// on Safari, it looks like it ends up making two requests. Perhaps it thinks
// the fetch/img requests look too different due to different headers or
// something.
export default function CancelableImg(props) {
  const [ref, setRef] = useState(null);
  useEffect(() => {
    return () => {
      if (ref != null) {
        // This will cause Chrome and Firefox to cancel the request.
        // Safari does not seem to get the message.
        ref.removeAttribute("src");
      }
    };
  }, [ref]);

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} ref={setRef} />;
}
