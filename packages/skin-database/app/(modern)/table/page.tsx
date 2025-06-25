import * as Skins from "../../../data/skins";
import Table from "./Table";

export default async function TablePage() {
  const skins = await Skins.getMuseumPage({
    offset: 0,
    first: 100,
  });

  const skinCount = await Skins.getClassicSkinCount();

  return (
    <div className="flex flex-col gap-4">
      <Table initialSkins={skins} skinCount={skinCount} />
    </div>
  );
}
