import React, { useMemo } from "react";
import { connect, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import * as Selectors from "./redux/selectors";
// import { SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT } from "./constants";

const DESCRIPTION =
  "Infinite scroll through 80k Winamp skins with interactive preview";

function useImageTags({ url, width, height, alt }) {
  return [
    <meta property="og:image" content={url} key={1} />,
    <meta property="og:image:width" content={width} key={2} />,
    <meta property="og:image:height" content={height} key={3} />,
    <meta property="og:image:type" content="image/png" key={4} />,
    <meta property="og:image:alt" content={alt} key={5} />,
    <meta name="twitter:image" content={url} key={6} />,
    <meta property="twitter:image:alt" content={alt} key={7} />,
  ];
}

function Head({ url: relativeUrl, pageTitle, previewImageUrl }) {
  useMemo(() => {
    // HACK! Helmet does not remove the values that are hard coded in index.html.
    // So, once JS loads, we remove them ourselves being careful not to only remove things that we will rerender.
    const elements = window.document.head.querySelectorAll(
      "meta, title, link[rel='canonical']"
    );
    Array.prototype.forEach.call(elements, function (node) {
      node.parentNode.removeChild(node);
    });
  }, []);

  const focusedSkinFile = useSelector(Selectors.getFocusedSkinFile);

  let readme = focusedSkinFile?.content?.slice(0, 300);
  const description = readme || DESCRIPTION;
  const pageUrl = `https://skins.webamp.org${relativeUrl}`;
  const imageTags = useImageTags(
    previewImageUrl
      ? {
          alt: "Screenshot of many Winamp skins in a grid.",
          url: previewImageUrl,
          //width: SCREENSHOT_WIDTH,
          //height: SCREENSHOT_HEIGHT,
          width: 1200,
          height: 600,
        }
      : {
          alt: "Screenshot of many Winamp skins in a grid.",
          url: "https://skin-museum-og-captbaritone-webamp.vercel.app/api/og",
          width: "1844",
          height: "1297",
        }
  );
  return (
    <Helmet canUseDOM={true}>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="theme-color" content="#000000" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site-name" content="Winamp Skin Museum" />

      <meta name="twitter:site" content="@winampskins" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@captbaritone" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />

      {imageTags}
    </Helmet>
  );
}

const mapStateToProps = (state) => ({
  url: Selectors.getUrl(state),
  pageTitle: Selectors.getPageTitle(state),
  previewImageUrl: Selectors.getPreviewImageUrl(state),
});

export default connect(mapStateToProps)(Head);
