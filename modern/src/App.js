import React, { useEffect, useReducer } from "react";
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

const skinUrls = [
  cornerSkin,
  "https://archive.org/cors/winampskin_MMD3/MMD3.wal",
  "https://archive.org/cors/winampskin_The_Official_Ford_Sync_Winamp5_Skin/The_Official_Ford_Sync_Winamp5_Skin.wal",
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

function useJsUpdates(node) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => node.js_listen("js_update", forceUpdate));
}

let mouseposition;

function handleMouseEventDispatch(node, event, eventName) {
  event.stopPropagation();

  // In order to properly calculate the x/y coordinates like MAKI does we need
  // to find the container element and calculate based off of that
  const container = Utils.findParentOrCurrentNodeOfType(
    node,
    new Set(["container"])
  );
  const clientX = event.clientX;
  const clientY = event.clientY;
  const x = clientX - (Number(container.attributes.x) || 0);
  const y = clientY - (Number(container.attributes.y) || 0);
  node.js_trigger(eventName, x, y);

  if (event.nativeEvent.type === "mousemove") {
    mouseposition = { x: clientX, y: clientY };
  }

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
        node,
        fakeEvent,
        eventName === "onLeftButtonDown" ? "onLeftButtonUp" : "onRightButtonUp"
      );
    });
  }
}

function handleMouseButtonEventDispatch(
  node,
  event,
  leftEventName,
  rightEventName
) {
  handleMouseEventDispatch(
    node,
    event,
    event.button === 2 ? rightEventName : leftEventName
  );
}

function GuiObjectEvents({ node, children }) {
  const { alpha, ghost } = node.attributes;
  if (!node.isvisible()) {
    return null;
  }

  return (
    <div
      onMouseDown={e =>
        handleMouseButtonEventDispatch(
          node,
          e,
          "onLeftButtonDown",
          "onRightButtonDown"
        )
      }
      onDoubleClick={e =>
        handleMouseButtonEventDispatch(
          node,
          e,
          "onLeftButtonDblClk",
          "onRightButtonDblClk"
        )
      }
      onMouseMove={e => handleMouseEventDispatch(node, e, "onMouseMove")}
      onMouseEnter={e => handleMouseEventDispatch(node, e, "onEnterArea")}
      onMouseLeave={e => handleMouseEventDispatch(node, e, "onLeaveArea")}
      onDragEnter={() => node.js_trigger("onDragEnter")}
      onDragLeave={() => node.js_trigger("onDragLeave")}
      onDragOver={e => handleMouseEventDispatch(node, e, "onDragOver")}
      onKeyUp={e => node.js_trigger("onKeyUp", e.keyCode)}
      onKeyDown={e => node.js_trigger("onKeyDown", e.keyCode)}
      onContextMenu={e => {
        e.preventDefault();
        return false;
      }}
      style={{
        opacity: alpha == null ? 1 : Number(alpha),
        pointerEvents: ghost === 1 ? "none" : null,
      }}
    >
      {children}
    </div>
  );
}

function Container(props) {
  const { id, node, default_x, default_y, default_visible } = props;
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

  const layout = node.getcurlayout();
  if (layout == null) {
    return null;
  }

  return (
    <div data-node-type="container" data-node-id={id} style={style}>
      <XmlNode node={layout} />
    </div>
  );
}

function Layout({
  node,
  id,
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
}) {
  if (drawBackground && background == null) {
    console.warn("Got a Layout without a background. Rendering null", id);
    return null;
  }

  if (drawBackground) {
    const image = node.js_imageLookup(background);
    if (image == null) {
      console.warn(
        "Unable to find image to render. Rendering null",
        background
      );
      return null;
    }

    return (
      <GuiObjectEvents node={node}>
        <div
          data-node-type="layout"
          data-node-id={id}
          src={image.imgUrl}
          draggable={false}
          style={{
            backgroundImage: `url(${image.imgUrl})`,
            width: image.w,
            height: image.h,
            // TODO: This combo of height/minHeight ect is a bit odd. How should we combine these?
            minWidth: minimum_w == null ? null : Number(minimum_w),
            minHeight: minimum_h == null ? null : Number(minimum_h),
            maxWidth: maximum_w == null ? null : Number(maximum_w),
            maxHeight: maximum_h == null ? null : Number(maximum_h),
            position: "absolute",
          }}
        >
          <XmlChildren node={node} />
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
  }
  if (h !== undefined) {
    params.height = Number(h);
  }

  return (
    <GuiObjectEvents node={node}>
      <div
        data-node-type="layout"
        data-node-id={id}
        draggable={false}
        style={{
          position: "absolute",
          ...params,
        }}
      >
        <XmlChildren node={node} />
      </div>
    </GuiObjectEvents>
  );
}

function Layer({ node, id, image, x, y }) {
  if (image == null) {
    console.warn("Got an Layer without an image. Rendering null", id);
    return null;
  }
  const img = node.js_imageLookup(image.toLowerCase());
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
    <GuiObjectEvents node={node}>
      <div
        data-node-type="Layer"
        data-node-id={id}
        draggable={false}
        style={{ position: "absolute", ...params }}
      >
        <XmlChildren node={node} />
      </div>
    </GuiObjectEvents>
  );
}

function Button({
  id,
  image,
  // action,
  x,
  y,
  downImage,
  tooltip,
  node,
}) {
  const [down, setDown] = React.useState(false);
  const imgId = down && downImage ? downImage : image;
  if (imgId == null) {
    console.warn("Got a Button without a imgId. Rendering null", id);
    return null;
  }
  // TODO: These seem to be switching too fast
  const img = node.js_imageLookup(imgId);
  if (img == null) {
    console.warn("Unable to find image to render. Rendering null", image);
    return null;
  }

  return (
    <GuiObjectEvents node={node}>
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
            node.js_trigger("onRightClick");
          } else {
            node.js_trigger("onLeftClick");
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
        }}
      >
        <XmlChildren node={node} />
      </div>
    </GuiObjectEvents>
  );
}

function Popupmenu({ id, node }) {
  const children = node.commands.map(item => {
    if (item.id === "seperator") {
      return <li />;
    }
    return (
      <li
        key={item.id}
        onClick={() => {
          node.js_selectCommand(item.id);
        }}
      >
        {item.name}
      </li>
    );
  });
  const { x, y } = mouseposition;
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

function ToggleButton(props) {
  return <Button data-node-type="togglebutton" {...props} />;
}

function Group({ node, id, x, y }) {
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
    <GuiObjectEvents node={node}>
      <div data-node-type="group" data-node-id={id} style={style}>
        <XmlChildren node={node} />
      </div>
    </GuiObjectEvents>
  );
}

function Text({
  node,
  id,
  display,
  // ticker,
  // antialias,
  x,
  y,
  w,
  h,
  // font,
  fontsize,
  color,
  align,
}) {
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
  return (
    <GuiObjectEvents node={node}>
      <div
        data-node-type="Text"
        data-node-id={id}
        draggable={false}
        style={{
          position: "absolute",
          userSelect: "none",
          MozUserSelect: "none",
          ...params,
        }}
      >
        {nodeText}
        <XmlChildren node={node} />
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
};

function DummyComponent({ node }) {
  console.warn("Unknown node type", node.name);
  return <XmlChildren node={node} />;
}

function XmlChildren({ node }) {
  if (node.children == null) {
    return null;
  }
  return node.children.map((childNode, i) => (
    <XmlNode key={i} node={childNode} {...childNode.attributes} />
  ));
}

// Given a skin XML node, pick which component to use, and render it.
function XmlNode({ node }) {
  const { name } = node;
  if (
    name == null ||
    name === "groupdef" ||
    name === "elements" ||
    name === "gammaset" ||
    name === "scripts"
  ) {
    // name is null is likely a comment
    return null;
  }
  useJsUpdates(node);
  const Component = NODE_NAME_TO_COMPONENT[name] || DummyComponent;
  return <Component node={node} {...node.attributes} />;
}

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

function App() {
  const dispatch = useDispatch();
  const store = useStore();
  const root = useSelector(Selectors.getMakiTree);
  React.useEffect(() => {
    const defaultSkinUrl = getSkinUrlFromQueryParams() || skinUrls[0];
    dispatch(Actions.gotSkinUrl(defaultSkinUrl, store));
  }, [store]);
  if (root == null) {
    return <h1>Loading...</h1>;
  }
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <DropTarget
        style={{ width: "100%", height: "100%" }}
        handleDrop={e => {
          dispatch(Actions.gotSkinBlob(e.dataTransfer.files[0], store));
        }}
      >
        <XmlNode node={root} />
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

export default App;
