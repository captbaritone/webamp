import React from "react";
import Grid from "./Grid";
import { getMuseumPageSkins } from "./getMuseumPageSkins";
import * as Skins from "../../..//data/skins";

export default async function SkinTable() {
  const [initialSkins, skinCount] = await Promise.all([
    getMuseumPageSkins(0, 50),
    Skins.getClassicSkinCount(),
  ]);
  console.log("SERVER RENDER generic");
  return <Grid initialSkins={initialSkins} initialTotal={skinCount} />;
}
