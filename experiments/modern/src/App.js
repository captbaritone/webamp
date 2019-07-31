import React from "react";
import JSZip from "jszip";
import "./App.css";
import * as Utils from "./utils";
import initialize from "./initialize";

// const runtime = require("./maki-interpreter/runtime");
// const System = require("./maki-interpreter/runtime/System");
// const interpret = require("./maki-interpreter/interpreter");

const IGNORE_IDS = new Set([
  // The maki script shows/hides these depending on which corner you are in
  "main2",
  "main3",
  "main4",
  "Title2",
  "Title3",
  "Title4",
  "mask2",
  "mask3",
  "mask4",
  "placeholder", // This looks like something related to an EQ window
  "Scaler",
  "toggle",
  "presets",
  "auto",
  // These need the maki script to get sized
  "volumethumb",
  "seekfull",
  "seek1",
  "Repeat",
]);

const SkinContext = React.createContext(null);

async function getSkin() {
  const resp = await fetch(process.env.PUBLIC_URL + "/skins/CornerAmp_Redux.wal");
  const blob = await resp.blob();
  const zip = await JSZip.loadAsync(blob);
  const skinXml = await Utils.inlineIncludes(
    await Utils.readXml(zip, "skin.xml"),
    zip
  );

  const { nodes, registry } = await initialize(zip, skinXml);

  // Gross hack returing a tuple here. We're just doing some crazy stuff to get
  // some data returned in the laziest way possible
  return [skinXml, nodes, registry];
}

function Layout({
  id,
  background,
  desktopalpha,
  drawBackground,
  minimum_h,
  maximum_h,
  minimum_w,
  maximum_w,
  droptarget,
  children,
}) {
  const data = React.useContext(SkinContext);
  if (background == null) {
    console.warn("Got a Layout without a background. Rendering null", id);
    return null;
  }

  const image = data[background];
  return (
    <>
      <img
        data-node-type="layout"
        data-node-id={id}
        src={image.imgUrl}
        style={{
          minWidth: Number(minimum_w),
          minHeight: Number(minimum_h),
          maxWidth: Number(maximum_w),
          maxHeight: Number(maximum_h),
          position: "absolute",
        }}
      />
      {children}
    </>
  );
}

function Layer({ id, image, children, x, y }) {
  const data = React.useContext(SkinContext);
  if (image == null) {
    console.warn("Got an Layer without an image. Rendering null", id);
    return null;
  }
  const img = data[image.toLowerCase()];
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
  return (
    <>
      <img
        data-node-type="Layer"
        data-node-id={id}
        src={img.imgUrl}
        style={Object.assign({ position: "absolute" }, params)}
      />
      {children}
    </>
  );
}

function Button({ id, image, action, x, y, downImage, tooltip, children }) {
  const data = React.useContext(SkinContext);
  const [down, setDown] = React.useState(false);
  const imgId = down && downImage ? downImage : image;
  if (imgId == null) {
    console.warn("Got a Button without a imgId. Rendering null", id);
    return null;
  }
  // TODO: These seem to be switching too fast
  const img = data[imgId.toLowerCase()];
  if (img == null) {
    console.warn("Unable to find image to render. Rendering null", image);
    return null;
  }

  return (
    <div
      data-node-type="button"
      data-node-id={id}
      onMouseDown={e => {
        setDown(true);
        document.addEventListener("mouseup", () => {
          // TODO: This could be unmounted
          setDown(false);
        });
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
      {children}
    </div>
  );
}

function ToggleButton(props) {
  return <Button data-node-type="togglebutton" {...props} />;
}

function Group(props) {
  const { id, children, x, y} = props;
  const style = {
    position: "absolute",
  };
  if (x !== undefined) {
    style.left = Number(x);
  }
  if (y !== undefined) {
    style.top = Number(y);
  }
  return <div
           data-node-type="group"
           data-node-id={id}
           style={style}>{children}</div>;
}

const NODE_NAME_TO_COMPONENT = {
  layout: Layout,
  layer: Layer,
  button: Button,
  togglebutton: ToggleButton,
  group: Group,
};

// Given a skin XML node, pick which component to use, and render it.
function XmlNode({ node }) {
  const attributes = node.attributes;
  const name = node.name;
  if (attributes && IGNORE_IDS.has(attributes.id)) {
    return null;
  }
  if (name == null) {
    // This is likely a comment
    return null;
  }
  const Component = NODE_NAME_TO_COMPONENT[name];
  const childNodes = node.children || [];
  const children = childNodes.map((childNode, i) => (
    <XmlNode key={i} parent={node} node={childNode} />
  ));
  if (Component == null) {
    console.warn("Unknown node type", name);
    if (childNodes.length) {
      return <>{children}</>;
    }
    return null;
  }
  return <Component {...attributes}>{children}</Component>;
}

function App() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    getSkin().then(setData);
  }, []);
  if (data == null) {
    return <h1>Loading...</h1>;
  }
  const [skinXml, nodes, registry] = data;
  return (
    <SkinContext.Provider value={registry.images}>
      <XmlNode
        node={nodes}
      />
    </SkinContext.Provider>
  );
}

export default App;
