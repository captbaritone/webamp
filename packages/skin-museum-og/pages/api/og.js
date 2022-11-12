import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "experimental-edge",
};

async function fetchGraphql(query, variables) {
  const response = await fetch("https://api.webampskins.org/graphql", {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    referrer: "https://skins.webamp.org/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify({ query, variables }),
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch skin info");
  }
  const json = await response.json();
  const { data } = json;
  return data;
}

function stripExt(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

export const SCREENSHOT_WIDTH = 275;
export const SCREENSHOT_HEIGHT = 348;

const QUERY = `
query Skin($md5: String!) {
    skin: fetch_skin_by_md5(md5: $md5) {
        filename
        screenshot_url
    }
}`;

async function searchImage(query) {
  const data = await fetchGraphql(
    `
    query SkinSearch($query: String!) {
        skins: search_skins(query: $query, first:20){
            ... on ClassicSkin {
                id
              filename
              screenshot_url
            }
        }
    }`,
    { query }
  );
  const aspectRatio = SCREENSHOT_WIDTH / SCREENSHOT_HEIGHT;
  return new ImageResponse(
    (
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
            {data.skins.map((skin) => {
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
          {query}
        </div>
      </Frame>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}

export default async function (req) {
  const { searchParams } = req.nextUrl;
  const skinMd5 = searchParams.get("md5");
  const query = searchParams.get("query");
  if (query) {
    return searchImage(query);
  }
  if (skinMd5 == null) {
    throw new Error("Expected skin md5");
  }
  const data = await fetchGraphql(QUERY, { md5: skinMd5 });
  const aspectRatio = SCREENSHOT_WIDTH / SCREENSHOT_HEIGHT;
  const FOO = 900;
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
              style={{ display: "flex", height: FOO / 3, overflow: "hidden" }}
            >
              <img
                src={data.skin.screenshot_url}
                height={String(FOO)}
                width={String(FOO * aspectRatio)}
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
            height={String(FOO / 2)}
            width={String((FOO / 2) * aspectRatio)}
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

function Frame({ children }) {
  return (
    <div
      style={{
        background: "black",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        justifyContent: "space-between",
        background: "linear-gradient(45deg,#000,#191927 66%,#000)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          justifyItems: "center",
          width: "100%",
          flexGrow: 10,
          // border: "1px solid red",
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
