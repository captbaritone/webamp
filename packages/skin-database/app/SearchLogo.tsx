"use client";
import { useWindowSize } from "../legacy-client/src/hooks";
import AlgoliaLogo from "../legacy-client/src/searchByAlgoliaDarkbBackground.svg";
import algoliaLogoSmallUrl from "../legacy-client/src/searchByAlgoliaSmall.png";

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
