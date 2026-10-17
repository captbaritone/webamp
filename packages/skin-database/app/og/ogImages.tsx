import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { ReactNode } from "react";
import { getMuseumPage } from "../../data/skins";
import SkinModel from "../../data/SkinModel";
import UserContext from "../../data/UserContext";
import { search_classic_skins } from "../../api/graphql/resolvers/SkinResolver";
import { screenshotUrlFromHash } from "../../legacy-client/src/utils";
import {
  SCREENSHOT_HEIGHT,
  SCREENSHOT_WIDTH,
} from "../../legacy-client/src/constants";

// The museum's link preview images (og:image): the museum, a search, and a
// skin. Same layouts as the skin-museum-og service on Vercel that made them
// before, but much lighter and crisper:
//
// - The renderer (satori, then resvg) scales images smoothly whatever the
//   CSS says, which blurs pixel art and fills it with in-between colors that
//   PNG compresses badly. So screenshots are scaled to the exact size they're
//   drawn at first, with nearest neighbor, and drawn 1:1.
// - Its PNGs are poorly compressed, so they're re-encoded with sharp: a
//   skin's as PNG (about 40 KB, down from about 650 KB), and the grids, whose
//   screenshots are drawn rotated and so resampled anyway, as JPEG.

const WIDTH = 1200;
const HEIGHT = 600;
const ASPECT = SCREENSHOT_WIDTH / SCREENSHOT_HEIGHT;
const GRID_SKINS = 20;

export type OgImage = { body: Buffer; contentType: string };

// Rendered images, so a burst of crawlers fetching a newly shared link (and
// every crawler after) don't each render it. The museum's order, search
// results and NSFW flags change, so not forever. Per server process.
const CACHE_MS = 6 * 60 * 60_000;
const MAX_CACHED = 500;
const cache = new Map<string, { at: number; image: Promise<OgImage> }>();

export function cachedImage(
  key: string,
  render: () => Promise<OgImage>
): Promise<OgImage> {
  const hit = cache.get(key);
  if (hit != null && Date.now() - hit.at < CACHE_MS) {
    // Most recently used last, so the oldest is evicted first.
    cache.delete(key);
    cache.set(key, hit);
    return hit.image;
  }
  const entry = { at: Date.now(), image: render() };
  cache.set(key, entry);
  entry.image.catch(() => {
    if (cache.get(key) === entry) cache.delete(key);
  });
  while (cache.size > MAX_CACHED) {
    cache.delete(cache.keys().next().value!);
  }
  return entry.image;
}

type Shot = { src: string; width: number; height: number };

/**
 * A skin's screenshot as a data URI at exactly `height` pixels tall (keeping
 * its shape), for the renderer to draw without scaling it. Scaled up with
 * nearest neighbor, so its pixels stay sharp.
 */
async function screenshot(md5: string, height: number): Promise<Shot> {
  const width = Math.round(height * ASPECT);
  const response = await fetch(screenshotUrlFromHash(md5));
  if (!response.ok) throw new Error(`No screenshot for ${md5}`);
  const source = Buffer.from(await response.arrayBuffer());
  const scaled = await sharp(source)
    .resize(width, height, {
      fit: "fill",
      kernel: height > SCREENSHOT_HEIGHT ? "nearest" : "lanczos3",
    })
    .png()
    .toBuffer();
  return {
    src: `data:image/png;base64,${scaled.toString("base64")}`,
    width,
    height,
  };
}

async function render(element: ReactNode, format: "png" | "jpeg") {
  const response = new ImageResponse(element as React.ReactElement, {
    width: WIDTH,
    height: HEIGHT,
  });
  const png = Buffer.from(await response.arrayBuffer());
  return format === "png"
    ? {
        body: await sharp(png).png({ compressionLevel: 9 }).toBuffer(),
        contentType: "image/png",
      }
    : {
        body: await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
        contentType: "image/jpeg",
      };
}

function stripExt(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "");
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(45deg,#000,#191927 66%,#000)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          flexGrow: 10,
          alignItems: "stretch",
        }}
      >
        {children}
      </div>
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(90deg,#111119,#282742 66%,#191927)",
          color: "white",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: "20px 30px",
          width: "100%",
        }}
      >
        <div>Winamp Skin Museum</div>
        <div>skins.webamp.org</div>
      </div>
    </div>
  );
}

// Screenshots tiled at an angle behind a title.
function Grid({ shots, title }: { shots: Shot[]; title: string }) {
  return (
    <Frame>
      <div style={{ display: "flex", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "-30px",
            width: "1400px",
            display: "flex",
            flexWrap: "wrap",
            transform: "rotate(-15deg)",
          }}
        >
          {shots.map((shot, i) => (
            <img key={i} style={{ margin: "15px" }} {...shot} />
          ))}
        </div>
      </div>
      <div
        style={{
          fontSize: 100,
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          textShadow: "0px 0px 10px black",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        {title}
      </div>
    </Frame>
  );
}

async function gridImage(md5s: string[], title: string): Promise<OgImage> {
  // A screenshot that won't load is left out rather than failing the image.
  const shots = (
    await Promise.allSettled(md5s.map((md5) => screenshot(md5, 300)))
  ).flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  return render(<Grid shots={shots} title={title} />, "jpeg");
}

/** The museum: its top skins. */
export async function museumImage(): Promise<OgImage> {
  const skins = await getMuseumPage({ offset: 0, first: GRID_SKINS });
  return gridImage(
    skins.filter((skin) => !skin.nsfw).map((skin) => skin.md5),
    "Winamp Skin Museum"
  );
}

/** A search: its top (non-NSFW) results. */
export async function searchImage(query: string): Promise<OgImage> {
  // Not filtered by the search itself: with nothing to match, a search that
  // filters returns the most popular skins rather than none.
  const results = await search_classic_skins(
    query,
    GRID_SKINS,
    0,
    null,
    new UserContext()
  );
  const md5s = await Promise.all(
    results.map(async (skin) =>
      skin == null || (await skin.nsfw()) ? null : skin.md5()
    )
  );
  return gridImage(
    md5s.filter((md5): md5 is string => md5 != null),
    query
  );
}

/** A skin, or null if there's no such skin. */
export async function skinImage(md5: string): Promise<OgImage | null> {
  const skin = await SkinModel.fromMd5(new UserContext(), md5);
  if (skin == null) return null;
  const [fileName, nsfw] = await Promise.all([
    skin.getFileName(),
    skin.getIsNsfw(),
  ]);
  const name = stripExt(fileName);
  // An NSFW skin's page covers its screenshot until you choose to see it, so
  // its preview shows only its name.
  if (nsfw) return render(<Grid shots={[]} title={name} />, "png");
  const [big, small] = await Promise.all([
    screenshot(md5, 900),
    screenshot(md5, 450),
  ]);
  return render(
    <Frame>
      <div
        style={{
          fontSize: 50,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", marginTop: 40 }}>
          {/* The top of the main window, close up. */}
          <div style={{ display: "flex", height: 300, overflow: "hidden" }}>
            <img {...big} />
          </div>
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          flexGrow: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingRight: "45px",
        }}
      >
        <img {...small} />
      </div>
    </Frame>,
    "png"
  );
}

/** A response for an image, or for its failure. */
export async function imageResponse(
  image: Promise<OgImage | null>
): Promise<Response> {
  try {
    const result = await image;
    if (result == null) return new Response("Not Found", { status: 404 });
    return new Response(new Uint8Array(result.body), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Failed to render a preview image", error);
    return new Response("Failed to render image", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
