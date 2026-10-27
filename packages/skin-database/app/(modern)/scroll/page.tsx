import React from "react";
import type { Metadata } from "next";
import { parseSearch } from "./searchQuery";
import Grid from "./Grid";
import { getMuseumPageSkins, getSearchSkins } from "./getMuseumPageSkins";
import * as Skins from "../../..//data/skins";
import { museumMetadata } from "../../museumMetadata";
import {
  museumListLength,
  parseMuseumSort,
  pickRandomSeed,
} from "./museumList";

// The museum's home page (served at / by middleware.ts).
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = await searchParams;
  return museumMetadata(query);
}

export default async function SkinTable({ searchParams }) {
  const { query, sort: sortParam } = await searchParams;
  const initialQuery = typeof query === "string" ? query : "";
  const search = initialQuery.trim();
  const sort = parseMuseumSort(sortParam);
  const seed = sort === "random" ? pickRandomSeed() : null;
  // With a search in the URL, start with its results rather than the museum's
  // first page (which loads if the search is cleared). Not for one using
  // has:/filter: syntax, which our SQLite search can't apply: the grid
  // searches Algolia itself, as when typing.
  const [
    initialSkins,
    initialSearchSkins,
    skinCount,
    sortedCount,
    downloadsCount,
  ] = await Promise.all([
    search === "" ? getMuseumPageSkins(0, 50, sort, seed) : [],
    search === "" || parseSearch(search).hasSyntax
      ? null
      : getSearchSkins(search).catch((error) => {
          // The grid will run the search itself.
          console.error("Initial search failed", error);
          return null;
        }),
    Skins.getMuseumPageCount(),
    Skins.getSortedMuseumCount(),
    Skins.getDownloadsMuseumCount(),
  ]);
  return (
    <Grid
      initialSkins={initialSkins}
      initialSearchSkins={initialSearchSkins}
      totals={{
        top: museumListLength(skinCount),
        downloads: downloadsCount,
        newest: sortedCount,
        random: sortedCount,
      }}
      initialQuery={initialQuery}
      initialSort={sort}
      initialSeed={seed}
    />
  );
}
