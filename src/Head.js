import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import * as Selectors from "./redux/selectors";
import { SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT } from "./constants";

function Head(props) {
  return (
    <Helmet canUseDOM={true}>
      <meta charSet="utf-8" />
      <title>{props.pageTitle}</title>
      <link rel="canonical" href={`https://skins.webamp.org${props.url}`} />
      <meta property="og:title" content={props.pageTitle} />
      <meta
        property="og:description"
        content="Infinite scroll through 65k Winamp skins with interactive preview"
      />
      <meta
        property="og:url"
        content={`https://skins.webamp.org${props.url}`}
      />
      <meta property="og:site-name" content="Winamp Skin Museum" />
      {props.previewImageUrl && [
        <meta
          property="og:image"
          key="og:image"
          content={props.previewImageUrl}
        />,
        <meta
          property="og:image:type"
          key="og:image:type"
          content="image/png"
        />,
        <meta
          property="og:image:width"
          key="og:image:width"
          content={SCREENSHOT_WIDTH}
        />,
        <meta
          property="og:image:height"
          key="og:image:height"
          content={SCREENSHOT_HEIGHT}
        />,
        <meta
          property="og:image:alt"
          key="og:image:alt"
          content={"Screenshot of a Winamp skin"}
        />,
      ]}
    </Helmet>
  );
}

const mapStateToProps = (state) => ({
  url: Selectors.getUrl(state),
  pageTitle: Selectors.getPageTitle(state),
  previewImageUrl: Selectors.getPreviewImageUrl(state),
});

export default connect(mapStateToProps)(Head);
