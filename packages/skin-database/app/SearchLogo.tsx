"use client";
import { useWindowSize } from "../../skin-museum-client/src/hooks";
import AlgoliaLogo from "../../skin-museum-client/src/searchByAlgoliaDarkbBackground.svg";
import algoliaLogoSmallUrl from "../../skin-museum-client/src/searchByAlgoliaSmall.png";

export default function SearchLogo() {
  const { windowWidth } = useWindowSize();
  if (windowWidth > 500) {
    return (
      <img
        alt="Search by Algolia"
        style={{
          width: AlgoliaLogo.width,
          height: AlgoliaLogo.height,
          paddingTop: 4,
        }}
        src={AlgoliaLogo.src}
      />
    );
  }
  return (
    <img
      alt="Search by Algolia"
      style={{
        width: 25,
        height: 25,
        paddingTop: 4,
      }}
      src={algoliaLogoSmallUrl.src}
    />
  );
}
