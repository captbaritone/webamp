import {
  screenshotUrlFromHash,
  skinUrlFromHash,
} from "../../../legacy-client/src/utils";
import { normalizeSkinFileName } from "./skinFileName";
import { skinPath } from "./paths";

export type GridSkin = {
  md5: string;
  screenshotUrl: string;
  fileName: string;
  nsfw: boolean;
};

/**
 * A skin as the grid shows it. Museum pages, the server's search and the
 * browser's all build theirs here, so a search's results look the same
 * whichever of them ran it.
 */
export function toGridSkin(
  md5: string,
  fileName: string,
  nsfw: boolean
): GridSkin {
  return {
    md5,
    screenshotUrl: screenshotUrlFromHash(md5),
    fileName: normalizeSkinFileName(fileName),
    nsfw,
  };
}

// What the feed shows of a skin beyond what the grid has, fetched for the
// skins around the one in view.
export type SkinDetails = {
  readme: string;
  likeCount: number;
};

// A skin as the feed shows it. Until its details arrive, `readme` is null.
export type ClientSkin = GridSkin & {
  skinUrl: string;
  downloadUrl: string;
  shareUrl: string;
  readme: string | null;
  likeCount: number;
};

export function toClientSkin(
  skin: GridSkin,
  details: SkinDetails | undefined
): ClientSkin {
  const skinUrl = skinUrlFromHash(skin.md5);
  return {
    ...skin,
    skinUrl,
    downloadUrl: skinUrl,
    shareUrl: `https://skins.webamp.org${skinPath(skin.md5, skin.fileName)}`,
    readme: details?.readme ?? null,
    likeCount: details?.likeCount ?? 0,
  };
}
