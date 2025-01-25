import KeyValue from "../data/KeyValue";
import SkinModel from "../data/SkinModel";
import UserContext from "../data/UserContext";
import { knex } from "../db";

export default async function detectRepacks() {
  const ctx = new UserContext();
  const stored = await KeyValue.get<{ [key: string]: string[] }>(
    "winampskins.info"
  );
  if (stored == null) {
    throw new Error("Expected kv");
  }

  // console.log(stored);

  let found = 0;
  let corrupt = 0;
  let identical = 0;

  for (const [key, orignalCandidates] of Object.entries(stored)) {
    const repack = await SkinModel.fromMd5Assert(ctx, key);

    for (const originalHash of orignalCandidates) {
      const original = await SkinModel.fromMd5Assert(ctx, originalHash);
      if (await isRepackOf(repack, original)) {
        console.log(`${key} is a repack of ${originalHash}`);
        found++;
      } else if (await areIdentical(repack, original)) {
        console.log(`${key} is an identical skin to ${originalHash}`);
        identical++;
      } else if (await isCorruptRepack(repack, original)) {
        console.log(`${key} is a CORRUPT repack of ${originalHash}`);
        corrupt++;
      }
    }
  }

  console.log(
    `Found ${found} originals out of ${Object.keys(stored).length} repacks`
  );
  console.log(
    `Found ${identical} twins out of ${Object.keys(stored).length} repacks`
  );
  console.log(
    `Found ${corrupt} corrupt repacks out of ${
      Object.keys(stored).length
    } repacks`
  );
}

// A skin is a repack if it contains exactly the same files except for the addition of advertizing files
async function isRepackOf(
  repack: SkinModel,
  original: SkinModel
): Promise<boolean> {
  const nonAdHashesSet = await getSkinArchiveFileHashesSansAds(repack);
  const hashesSet = await getSkinArchiveFileHashes(original);
  return setsAreEqual(nonAdHashesSet, hashesSet);
}

async function isCorruptRepack(
  repack: SkinModel,
  original: SkinModel
): Promise<boolean> {
  const repackHashesSet = await getSkinArchiveFileHashes(repack);
  const hashesSet = await getSkinArchiveFileHashes(original);
  return setContains(repackHashesSet, hashesSet);
}

async function areIdentical(
  repack: SkinModel,
  original: SkinModel
): Promise<boolean> {
  const repackHashesSet = await getSkinArchiveFileHashes(repack);
  const hashesSet = await getSkinArchiveFileHashes(original);
  return setsAreEqual(repackHashesSet, hashesSet);
}

async function getSkinArchiveFileHashes(skin: SkinModel): Promise<Set<string>> {
  const archiveFiles = await skin.getArchiveFiles();
  const nonAdHashes = archiveFiles.map((f) => f.getFileMd5());

  return new Set(nonAdHashes);
}

async function getSkinArchiveFileHashesSansAds(
  skin: SkinModel
): Promise<Set<string>> {
  const archiveFiles = await skin.getArchiveFiles();
  const nonAdFiles = archiveFiles.filter(
    (f) => !f.getFileName().match(/winampskins\.info/)
  );

  const nonAdHashes = nonAdFiles.map((f) => f.getFileMd5());

  return new Set(nonAdHashes);
}

// Get all the skins that have ad files in them
async function getRepackSkins(ctx: UserContext) {
  const rows = await knex.raw(
    `SELECT DISTINCT(skin_md5) FROM archive_files WHERE file_name = "winampskins.info.txt";`
  );
  return Promise.all(
    rows.map((row) => {
      return SkinModel.fromMd5Assert(ctx, row.skin_md5);
    })
  );
}

function setsAreEqual(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

// Does a contain b?
function setContains(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size < b.size) {
    return false;
  }
  for (const value of b) if (!a.has(value)) return false;
  return true;
}

async function foo() {
  const repacks = await getRepackSkins(ctx);
  for (const skin of repacks) {
    const md5 = skin.getMd5();
    if (stored[md5] != null) {
      console.log(`Already computed ${md5}`);
      continue;
    }
    const archiveFiles = await skin.getArchiveFiles();
    const archiveFilesMd5 = archiveFiles.map((af) => af.getFileMd5());

    const matches = await knex.raw(`
          SELECT 
      skin_md5
  FROM 
  (
      SELECT 
          skin_md5,
          COUNT(*) as total_files,
          SUM(CASE WHEN file_md5 IN (${archiveFilesMd5
            .map((m) => `"${m}"`)
            .join(",")}) THEN 1 ELSE 0 END) as matching_files
      FROM 
          archive_files
      GROUP BY 
          skin_md5
  ) AS t
  WHERE 
      total_files = matching_files;
          `);
    const filtered = matches
      .map((r) => r.skin_md5)
      .filter((m) => m != skin_md5);
    stored[skin_md5] = filtered;
    await KeyValue.update("winampskins.info", stored);
    console.log(`Stored that ${skin_md5} matches ${JSON.stringify(filtered)}`);
  }
}
