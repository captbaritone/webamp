import React from "react";
import type { Metadata } from "next";
import Grid from "./Grid";
import { getMuseumPageSkins, getSearchSkins } from "./getMuseumPageSkins";
import * as Skins from "../../..//data/skins";
import { museumMetadata } from "../../museumMetadata";

// The museum's home page (served at / by middleware.ts).
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = await searchParams;
  return museumMetadata(query);
}

export default async function SkinTable({ searchParams }) {
  const { query } = await searchParams;
  const initialQuery = typeof query === "string" ? query : "";
  const search = initialQuery.trim();
  // With a search in the URL, start with its results rather than the museum's
  // first page (which loads if the search is cleared).
  const [initialSkins, initialSearchSkins, skinCount] = await Promise.all([
    search === "" ? getMuseumPageSkins(0, 50) : [],
    search === ""
      ? null
      : getSearchSkins(search).catch((error) => {
          // The grid will run the search itself.
          console.error("Initial search failed", error);
          return null;
        }),
    Skins.getMuseumPageCount(),
  ]);
  return (
    <Grid
      initialSkins={initialSkins}
      initialSearchSkins={initialSearchSkins}
      initialTotal={skinCount}
      initialQuery={initialQuery}
    />
  );
}
