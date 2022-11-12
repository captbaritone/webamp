import { ImageResponse } from "@vercel/og";
import Frame from "../../src/og/Frame";
import { fetchGraphql, stripExt } from "../../src/og/ogUtils";

export const config = {
  runtime: "experimental-edge",
};

export const SCREENSHOT_WIDTH = 275;
export const SCREENSHOT_HEIGHT = 348;

const aspectRatio = SCREENSHOT_WIDTH / SCREENSHOT_HEIGHT;

export default async function (req) {
  const { searchParams } = req.nextUrl;
  const skinMd5 = searchParams.get("md5");
  const query = searchParams.get("query");
  if (query) {
    return searchImage(query);
  }
  if (skinMd5) {
    return permalinkImage(skinMd5);
  }
  return homeImage();
}

async function homeImage() {
  const data = await fetchGraphql(
    `
    query HomeSkins {
        skins(first:20, sort: MUSEUM){
          nodes {
            ... on ClassicSkin {
              id
              nsfw
              filename
              screenshot_url
            }
          }
        }
    }`,
    {}
  );
  return new ImageResponse(
    <ImageGrid skins={data.skins.nodes} title={"Winamp Skin Museum"} />,
    {
      width: 1200,
      height: 600,
    }
  );
}

async function searchImage(query) {
  const data = await fetchGraphql(
    `
    query SkinSearch($query: String!) {
        skins: search_skins(query: $query, first:20){
            ... on ClassicSkin {
              id
              nsfw
              filename
              screenshot_url
            }
        }
    }`,
    { query }
  );
  return new ImageResponse(<ImageGrid skins={data.skins} title={query} />, {
    width: 1200,
    height: 600,
  });
}

function ImageGrid({ skins, title }) {
  return (
    <Frame>
      <div
        style={{
          display: "flex",
          position: "relative",
        }}
      >
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
          {skins
            .filter((skin) => {
              return !skin.nsfw;
            })
            .map((skin) => {
              return (
                <img
                  style={{
                    margin: "15px",
                  }}
                  key={skin.id}
                  src={skin.screenshot_url}
                  height={String(300)}
                  width={String(300 * aspectRatio)}
                />
              );
            })}
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

async function permalinkImage(skinMd5) {
  const data = await fetchGraphql(
    `
  query Skin($md5: String!) {
      skin: fetch_skin_by_md5(md5: $md5) {
          filename
          screenshot_url
      }
  }`,
    { md5: skinMd5 }
  );
  const size = 900;
  return new ImageResponse(
    (
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
          <div style={{ display: "flex", marginTop: "40" }}>
            <div
              style={{ display: "flex", height: size / 3, overflow: "hidden" }}
            >
              <img
                src={data.skin.screenshot_url}
                height={String(size)}
                width={String(size * aspectRatio)}
              />
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
            {stripExt(data.skin.filename)}
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
          <img
            src={data.skin.screenshot_url}
            height={String(size / 2)}
            width={String((size / 2) * aspectRatio)}
          />
        </div>
      </Frame>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}
