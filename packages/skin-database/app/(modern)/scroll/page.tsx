import React from "react";
import type { Metadata } from "next";
import Grid from "./Grid";
import { getMuseumPageSkins } from "./getMuseumPageSkins";
import * as Skins from "../../..//data/skins";
import { museumMetadata } from "../../museumMetadata";

// The museum's home page (served at / by middleware.ts).
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = await searchParams;
  return museumMetadata(query);
}

export default async function SkinTable({ searchParams }) {
  const [{ query }, initialSkins, skinCount] = await Promise.all([
    searchParams,
    getMuseumPageSkins(0, 50),
    Skins.getMuseumPageCount(),
  ]);
  return (
    <Grid
      initialSkins={initialSkins}
      initialTotal={skinCount}
      initialQuery={typeof query === "string" ? query : ""}
    />
  );
}
