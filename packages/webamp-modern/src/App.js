import React, { Suspense } from "react";
import "./App.css";
import * as Actions from "./Actions";
import * as Selectors from "./Selectors";
// import simpleSkin from "../skins/simple.wal";
import cornerSkin from "../skins/CornerAmp_Redux.wal";
import { useDispatch, useSelector, useStore } from "react-redux";
import DropTarget from "./components/DropTarget";
import { Maki } from "./MakiRenderer";
const Dashboard = React.lazy(() => import("./Dashboard"));

const skinUrls = [
  cornerSkin,
  "https://archive.org/cors/winampskin_MMD3/MMD3.wal",
  "https://archive.org/cors/winampskin_The_Official_Ford_Sync_Winamp5_Skin/The_Official_Ford_Sync_Winamp5_Skin.wal",
  "https://archive.org/cors/winampskin_Godsmack_Faceless/Godsmack_-_Faceless.wal",
  "https://archive.org/cors/winampskin_Tokyo_Drift/Tokyo_Drift.wal",
  "https://archive.org/cors/winampskin_Nebular/Nebular.wal",
  "https://archive.org/cors/winampskin_Official_Enter_the_Matrix_Skin/Enter_the_Matrix.wal",
  "https://archive.org/cors/winampskin_Reel-To-Reel_Machine_Sony_Edition/ReelToReel_Machine__Sony_Edition.wal",
  "https://archive.org/cors/winampskin_Casio-G-Shocked-V5/Casio-G-Shocked-V2.wal",
  "https://archive.org/cors/winampskin_ZDL_GOLD_STACK/ZDL_GOLD_STACK.wal",
  "https://archive.org/cors/winampskin_BLAKK/BLAKK.wal",
  "https://archive.org/cors/winampskin_Braun_CC_50/Braun_CC_50.wal",
  "https://archive.org/cors/winampskin_Walk_Hard_Winamp5_Skin/Walk_Hard_Winamp5_Skin.wal",
  "https://archive.org/cors/winampskin_Freddy_vs_Jason/Freddy_vs_Jason.wal",
  "https://archive.org/cors/winampskin_The_Official_Grind_Winamp_3_Skin/The_Official_Grind_Winamp_3_Skin.wal",
  "https://archive.org/cors/winampskin_The_KidsWB_Winamp_3_Skin/The_KidsWB_Winamp_3_Skin.wal",
  "https://archive.org/cors/winampskin_Sailor_Moon_Modern_version_1/Sailor_Moon_Modern_version_1.wal",
  "https://archive.org/cors/winampskin_Dr_Who_--_Monsters_and_Villains/Dr_Who_--_Monsters_and_Villains.wal",
  "https://archive.org/cors/winampskin_Official_Linkin_Park_Skin/Official_Linkin_Park_Skin.wal",
  "https://archive.org/cors/winampskin_Resin/Resin.wal",
  "https://archive.org/cors/winampskin_PAD/PAD.wal",
  "https://archive.org/cors/winampskin_MIPOD/MIPOD.wal",
  "https://archive.org/cors/winampskin_Ebonite_2.0/Ebonite_2_1.wal",
  "https://archive.org/cors/winampskin_Drone_v1dot1/Drone_v1.wal",
  "https://archive.org/cors/winampskin_Hoop_Life_Modern/Hoop_Life_WA3_version.wal",
  "https://archive.org/cors/winampskin_Austin_Powers_Goldmember_Skin/Official_Austin_Powers_3_Skin.wal",
  "https://archive.org/cors/winampskin_Coca_Cola_My_Coke_Music/Coca_Cola__My_Coke_Music.wal",
  "https://archive.org/cors/winampskin_Barracuda_Winamp/Barracuda_Winamp.wal",
  "https://archive.org/cors/winampskin_Nike_total_90_aerow/Nike_total_90_aerow.wal",
  "https://archive.org/cors/winampskin_Metallica_Metallica/Metallica_Metallica.wal",
  "https://archive.org/cors/winampskin_Epsilux/Epsilux.wal",
  "https://archive.org/cors/winampskin_Official_Witchblade_TV_Series_Skin/Official_Witchblade_TV_Series_Skin.wal",
  "https://archive.org/cors/winampskin_ocrana/ocrana.wal",
  "https://archive.org/cors/winampskin_Clean_AMP/Clean_AMP.wal",
  "https://archive.org/cors/winampskin_Xbox_Amp/Xbox_Amp.wal",
  "https://archive.org/cors/winampskin_Lapis_Lazuli/Lapis_Lazuli.wal",
  "https://archive.org/cors/winampskin_The_Punisher_Winamp_5_Skin/The_Punisher_Winamp_5_Skin.wal",
  "https://archive.org/cors/winampskin_The_Chronicles_of_Riddick/The_Chronicles_of_Riddick.wal",
  "https://archive.org/cors/winampskin_Official_Midnight_Club_2_skin/Official_Midnight_Club_2_skin.wal",
  "https://archive.org/cors/winampskin_Official_Torque_Winamp5_Skin/Official_Torque_Winamp5_Skin.wal",
  "https://archive.org/cors/winampskin_Official_Mad_Magazine_Skin/Official_Mad_Magazine_Skin.wal",
  "https://archive.org/cors/winampskin_PUMA_v1.08_Speed_Boot_Winamp5_Skin/PUMA_v1.08_Speed_Boot_Winamp5_Skin.wal",
  "https://archive.org/cors/winampskin_EMP/EMP.wal",
  "https://archive.org/cors/winampskin_Devay/Devay.wal",
];

function getSkinUrlFromQueryParams() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("skinUrl");
}

function setSkinUrlToQueryParams(skinUrl) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("skinUrl", skinUrl);
  const newRelativePathQuery = `${
    window.location.pathname
  }?${searchParams.toString()}`;
  window.history.pushState(null, "", newRelativePathQuery);
}

function Loading() {
  return <h1>Loading...</h1>;
}

function Modern() {
  const dispatch = useDispatch();
  const store = useStore();
  const root = useSelector(Selectors.getMakiTree);
  const [skinUrl, setSkinUrl] = React.useState(null);
  React.useEffect(() => {
    const defaultSkinUrl = getSkinUrlFromQueryParams() || skinUrls[0];
    setSkinUrl(defaultSkinUrl);
    dispatch(Actions.gotSkinUrl(defaultSkinUrl, store));
  }, [store, dispatch]);
  if (root == null) {
    return <Loading />;
  }
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <DropTarget
        style={{ width: "100%", height: "100%" }}
        handleDrop={(e) => {
          dispatch(Actions.gotSkinBlob(e.dataTransfer.files[0], store));
        }}
      >
        <Maki makiObject={root} />
      </DropTarget>
      <select
        style={{ position: "absolute", bottom: 0 }}
        value={skinUrl}
        onChange={(e) => {
          const newSkinUrl = e.target.value;
          setSkinUrl(newSkinUrl);
          // TODO: This should really go in a middleware somewhere.
          setSkinUrlToQueryParams(newSkinUrl);
          dispatch(Actions.gotSkinUrl(newSkinUrl, store));
        }}
      >
        {skinUrls.map((url) => (
          <option value={url} key={url}>
            {url}
          </option>
        ))}
      </select>
    </div>
  );
}
function App() {
  return (
    <Suspense fallback={<Loading />}>
      {window.location.pathname.includes("ready") ? <Dashboard /> : <Modern />}
    </Suspense>
  );
}

export default App;
