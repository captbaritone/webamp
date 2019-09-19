import React, { useEffect, useReducer, Suspense } from "react";
import "./App.css";
import * as Utils from "./utils";
import * as Actions from "./Actions";
import * as Selectors from "./Selectors";
// import simpleSkin from "../skins/simple.wal";
import cornerSkin from "../skins/CornerAmp_Redux.wal";
import { useDispatch, useSelector, useStore } from "react-redux";
import DropTarget from "../../js/components/DropTarget";
import Debugger from "./debugger";
import Sidebar from "./Sidebar";
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

function useJsUpdates(makiObject) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => makiObject.js_listen("js_update", forceUpdate));
}

function handleMouseEventDispatch(makiObject, event, eventName) {
  event.stopPropagation();

  // In order to properly calculate the x/y coordinates like MAKI does we need
  // to find the container element and calculate based off of that
  const container = Utils.findParentOrCurrentNodeOfType(
    makiObject,
    new Set(["container"])
  );
  const clientX = event.clientX;
  const clientY = event.clientY;
  const x = clientX - (Number(container.attributes.x) || 0);
  const y = clientY - (Number(container.attributes.y) || 0);
  makiObject.js_trigger(eventName, x, y);

  if (event.nativeEvent.type === "mousedown") {
    // We need to persist the react event so we can access the target
    event.persist();
    document.addEventListener("mouseup", function globalMouseUp(ev) {
      document.removeEventListener("mouseup", globalMouseUp);
      // Create an object that looks and acts like an event, but has mixed
      // properties from original mousedown event and new mouseup event
      const fakeEvent = {
        target: event.target,
        clientX: ev.clientX,
        clientY: ev.clientY,
        nativeEvent: {
          type: "mouseup",
        },
        stopPropagation: ev.stopPropagation.bind(ev),
      };
      handleMouseEventDispatch(
        makiObject,
        fakeEvent,
        eventName === "onLeftButtonDown" ? "onLeftButtonUp" : "onRightButtonUp"
      );
    });
  }
}

function handleMouseButtonEventDispatch(
  makiObject,
  event,
  leftEventName,
  rightEventName
) {
  handleMouseEventDispatch(
    makiObject,
    event,
    event.button === 2 ? rightEventName : leftEventName
  );
}

function GuiObjectEvents({ makiObject, children }) {
  const { alpha, ghost } = makiObject.attributes;
  if (!makiObject.isvisible()) {
    return null;
  }

  return (
    <div
      onMouseDown={e =>
        handleMouseButtonEventDispatch(
          makiObject,
          e,
          "onLeftButtonDown",
          "onRightButtonDown"
        )
      }
      onDoubleClick={e =>
        handleMouseButtonEventDispatch(
          makiObject,
          e,
          "onLeftButtonDblClk",
          "onRightButtonDblClk"
        )
      }
      onMouseMove={e => handleMouseEventDispatch(makiObject, e, "onMouseMove")}
      onMouseEnter={e => handleMouseEventDispatch(makiObject, e, "onEnterArea")}
      onMouseLeave={e => handleMouseEventDispatch(makiObject, e, "onLeaveArea")}
      onDragEnter={() => makiObject.js_trigger("onDragEnter")}
      onDragLeave={() => makiObject.js_trigger("onDragLeave")}
      onDragOver={e => handleMouseEventDispatch(makiObject, e, "onDragOver")}
      onKeyUp={e => makiObject.js_trigger("onKeyUp", e.keyCode)}
      onKeyDown={e => makiObject.js_trigger("onKeyDown", e.keyCode)}
      onContextMenu={e => {
        e.preventDefault();
        return false;
      }}
      style={{
        opacity: alpha == null ? 1 : alpha / 255,
        pointerEvents: ghost ? "none" : null,
      }}
    >
      {children}
    </div>
  );
}

function Container({ makiObject }) {
  const { id, default_x, default_y, default_visible } = makiObject.attributes;

  const style = {
    position: "absolute",
  };
  if (default_x !== undefined) {
    style.left = Number(default_x);
  }
  if (default_y !== undefined) {
    style.top = Number(default_y);
  }
  if (default_visible !== undefined) {
    style.display = default_visible ? "block" : "none";
  }

  const layout = makiObject.getcurlayout();
  if (layout == null) {
    return null;
  }

  return (
    <div data-node-type="container" data-node-id={id} style={style}>
      <Maki makiObject={layout} />
    </div>
  );
}

function Layout({ makiObject }) {
  const {
    id,
    js_assets,
    background,
    // desktopalpha,
    drawBackground,
    x,
    y,
    w,
    h,
    minimum_h,
    maximum_h,
    minimum_w,
    maximum_w,
    // droptarget,
  } = makiObject.attributes;
  if (drawBackground && background == null) {
    console.warn("Got a Layout without a background. Rendering null", id);
    return null;
  }

  if (drawBackground) {
    const image = js_assets.background;
    if (image == null) {
      console.warn(
        "Unable to find image to render. Rendering null",
        background
      );
      return null;
    }

    return (
      <GuiObjectEvents makiObject={makiObject}>
        <div
          data-node-type="layout"
          data-node-id={id}
          src={image.imgUrl}
          draggable={false}
          style={{
            backgroundImage: `url(${image.imgUrl})`,
            width: image.w,
            height: image.h,
            overflow: "hidden",
            // TODO: This combo of height/minHeight ect is a bit odd. How should we combine these?
            minWidth: minimum_w == null ? null : Number(minimum_w),
            minHeight: minimum_h == null ? null : Number(minimum_h),
            maxWidth: maximum_w == null ? null : Number(maximum_w),
            maxHeight: maximum_h == null ? null : Number(maximum_h),
            position: "absolute",
          }}
        >
          <MakiChildren makiObject={makiObject} />
        </div>
      </GuiObjectEvents>
    );
  }

  const params = {};
  if (x !== undefined) {
    params.left = Number(x);
  }
  if (y !== undefined) {
    params.top = Number(y);
  }
  if (w !== undefined) {
    params.width = Number(w);
    params.overflow = "hidden";
  }
  if (h !== undefined) {
    params.height = Number(h);
    params.overflow = "hidden";
  }

  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div
        data-node-type="layout"
        data-node-id={id}
        draggable={false}
        style={{
          position: "absolute",
          ...params,
        }}
      >
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

function Layer({ makiObject }) {
  const { id, js_assets, image, x, y } = makiObject.attributes;
  if (image == null) {
    console.warn("Got an Layer without an image. Rendering null", id);
    return null;
  }
  const img = js_assets.image;
  if (img == null) {
    console.warn("Unable to find image to render. Rendering null", image);
    return null;
  }
  const params = {};
  if (x !== undefined) {
    params.left = Number(x);
  }
  if (y !== undefined) {
    params.top = Number(y);
  }
  if (img.x !== undefined) {
    params.backgroundPositionX = -Number(img.x);
  }
  if (img.y !== undefined) {
    params.backgroundPositionY = -Number(img.y);
  }
  if (img.w !== undefined) {
    params.width = Number(img.w);
  }
  if (img.h !== undefined) {
    params.height = Number(img.h);
  }
  if (img.imgUrl !== undefined) {
    params.backgroundImage = `url(${img.imgUrl}`;
  }
  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div
        data-node-type="Layer"
        data-node-id={id}
        draggable={false}
        style={{ position: "absolute", ...params }}
      >
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

function animatedLayerOffsetAndSize(
  frameNum,
  frameSize,
  layerSize,
  imgSize,
  imgOffset
) {
  let size, offset;
  if (frameSize !== undefined) {
    size = Number(frameSize);
    offset = -Number(frameSize) * frameNum;
  } else if (layerSize !== undefined) {
    size = Number(layerSize);
    offset = -Number(layerSize) * frameNum;
  } else {
    if (imgSize !== undefined) {
      size = Number(imgSize);
    }
    if (imgOffset !== undefined) {
      offset = -Number(imgOffset);
    }
  }
  return { offset, size };
}

function AnimatedLayer({ makiObject }) {
  const {
    id,
    js_assets,
    x,
    y,
    w,
    h,
    framewidth,
    frameheight,
  } = makiObject.attributes;
  const img = js_assets.image;
  if (img == null) {
    console.warn("Got an AnimatedLayer without an image. Rendering null", id);
    return null;
  }

  const frameNum = makiObject.getcurframe();

  let style = {};
  if (x !== undefined) {
    style.left = Number(x);
  }
  if (y !== undefined) {
    style.top = Number(y);
  }

  const {
    offset: backgroundPositionX,
    size: width,
  } = animatedLayerOffsetAndSize(frameNum, framewidth, w, img.w, img.x);
  const {
    offset: backgroundPositionY,
    size: height,
  } = animatedLayerOffsetAndSize(frameNum, frameheight, h, img.h, img.y);
  style = { ...style, width, height, backgroundPositionX, backgroundPositionY };

  if (img.imgUrl !== undefined) {
    style.backgroundImage = `url(${img.imgUrl}`;
  }

  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div
        data-node-type="AnimatedLayer"
        data-node-id={id}
        draggable={false}
        style={{ position: "absolute", ...style }}
      >
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

function Button({ makiObject }) {
  const {
    id,
    js_assets,
    // image,
    // action,
    x,
    y,
    downImage,
    tooltip,
    ghost,
  } = makiObject.attributes;
  const [down, setDown] = React.useState(false);
  // TODO: These seem to be switching too fast
  const img = down && downImage ? js_assets.downimage : js_assets.image;
  if (img == null) {
    console.warn("Got a Button without a img. Rendering null", id);
    return null;
  }

  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div
        data-node-type="button"
        data-node-id={id}
        onMouseDown={() => {
          setDown(true);
          document.addEventListener("mouseup", () => {
            // TODO: This could be unmounted
            setDown(false);
          });
        }}
        onClick={e => {
          if (e.button === 2) {
            makiObject.js_trigger("onRightClick");
          } else {
            makiObject.js_trigger("onLeftClick");
          }
        }}
        title={tooltip}
        style={{
          position: "absolute",
          top: Number(y),
          left: Number(x),
          backgroundPositionX: -Number(img.x),
          backgroundPositionY: -Number(img.y),
          width: Number(img.w),
          height: Number(img.h),
          backgroundImage: `url(${img.imgUrl})`,
          pointerEvents: ghost ? "none" : null,
        }}
      >
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

function Popupmenu({ makiObject }) {
  const { id, x, y } = makiObject.attributes;

  const children = makiObject.commands.map(item => {
    if (item.id === "seperator") {
      return <li />;
    }
    return (
      <li
        key={item.id}
        onClick={() => {
          makiObject.js_selectCommand(item.id);
        }}
      >
        {item.name}
      </li>
    );
  });
  // TODO: Actually properly style element
  return (
    <div
      data-node-type="Popmenu"
      data-node-id={id}
      style={{
        position: "absolute",
        top: Number(y),
        left: Number(x),
        backgroundColor: "#000000",
        color: "#FFFFFF",
      }}
    >
      <ul>{children}</ul>
    </div>
  );
}

function ToggleButton({ makiObject }) {
  return <Button makiObject={makiObject} />;
}

function Group({ makiObject }) {
  const { id, x, y } = makiObject.attributes;
  const style = {
    position: "absolute",
  };
  if (x !== undefined) {
    style.left = Number(x);
  }
  if (y !== undefined) {
    style.top = Number(y);
  }
  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div data-node-type="group" data-node-id={id} style={style}>
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

function Text({ makiObject }) {
  const {
    id,
    display,
    // ticker,
    // antialias,
    x,
    y,
    w,
    h,
    font,
    fontsize,
    color,
    align,
  } = makiObject.attributes;
  const params = {};
  if (x !== undefined) {
    params.left = Number(x);
  }
  if (y !== undefined) {
    params.top = Number(y);
  }
  if (w !== undefined) {
    params.width = Number(w);
  }
  if (h !== undefined) {
    params.height = Number(h);
  }
  if (color !== undefined) {
    params.color = `rgb(${color})`;
  }
  if (fontsize !== undefined) {
    params.fontSize = `${fontsize}px`;
  }
  if (align !== undefined) {
    params.textAlign = align;
  }
  // display is actually a keyword that is looked up in some sort of map
  // e.g. songname, time
  const nodeText = display;
  const js_attributes = makiObject.js_fontLookup(font.toLowerCase());
  const fontFamily = js_attributes == null ? null : js_attributes.fontFamily;
  const style = {
    position: "absolute",
    userSelect: "none",
    MozUserSelect: "none",
    ...params,
    fontFamily,
  };

  return (
    <GuiObjectEvents makiObject={makiObject}>
      <div
        data-node-type="Text"
        data-node-id={id}
        draggable={false}
        style={style}
      >
        {nodeText}
        <MakiChildren makiObject={makiObject} />
      </div>
    </GuiObjectEvents>
  );
}

const NODE_NAME_TO_COMPONENT = {
  container: Container,
  layout: Layout,
  layer: Layer,
  button: Button,
  togglebutton: ToggleButton,
  group: Group,
  popupmenu: Popupmenu,
  text: Text,
  animatedlayer: AnimatedLayer,
};

function DummyComponent({ makiObject }) {
  console.warn("Unknown makiObject type", makiObject.name);
  return <MakiChildren makiObject={makiObject} />;
}

function MakiChildren({ makiObject }) {
  return makiObject
    .js_getChildren()
    .map((childMakiObject, i) => <Maki key={i} makiObject={childMakiObject} />);
}

// Given a skin XML node, pick which component to use, and render it.
const Maki = React.memo(({ makiObject }) => {
  let { name } = makiObject;
  if (name == null) {
    // name is null is likely a comment
    return null;
  }
  name = name.toLowerCase();
  if (
    name === "groupdef" ||
    name === "elements" ||
    name === "gammaset" ||
    name === "scripts" ||
    name === "script" ||
    name === "skininfo"
  ) {
    // these nodes dont need to be rendered
    return null;
  }
  useJsUpdates(makiObject);
  const Component = NODE_NAME_TO_COMPONENT[name] || DummyComponent;
  return <Component makiObject={makiObject} />;
});

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
  React.useEffect(() => {
    const defaultSkinUrl = getSkinUrlFromQueryParams() || skinUrls[0];
    dispatch(Actions.gotSkinUrl(defaultSkinUrl, store));
  }, [store]);
  if (root == null) {
    return <Loading />;
  }
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <DropTarget
        style={{ width: "100%", height: "100%" }}
        handleDrop={e => {
          dispatch(Actions.gotSkinBlob(e.dataTransfer.files[0], store));
        }}
      >
        <Maki makiObject={root} />
      </DropTarget>
      <select
        style={{ position: "absolute", bottom: 0 }}
        onChange={e => {
          const newSkinUrl = e.target.value;
          // TODO: This should really go in a middleware somewhere.
          setSkinUrlToQueryParams(newSkinUrl);
          dispatch(Actions.gotSkinUrl(newSkinUrl, store));
        }}
      >
        {skinUrls.map(url => (
          <option value={url} key={url}>
            {url}
          </option>
        ))}
      </select>
      <Sidebar>
        <Debugger />
      </Sidebar>
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
