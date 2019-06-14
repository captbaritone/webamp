import React from "react";
import JSZip from "jszip";
import "./App.css";
import * as Utils from "./utils";

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
  const resp = await fetch(
    process.env.PUBLIC_URL + "/skins/CornerAmp_Redux.wal"
  );
  const blob = await resp.blob();
  const zip = await JSZip.loadAsync(blob);
  const skinXml = await Utils.inlineIncludes(
    await Utils.readXml(zip, "skin.xml"),
    zip
  );

  const images = {};
  await Utils.asyncTreeMap(skinXml, async node => {
    // TODO: This is probalby only valid if in an `<elements>` node
    switch (node.name) {
      case "bitmap": {
        const { file, gammagroup, h, id, w, x, y } = node.attributes;
        // TODO: Escape file for regex
        const img = Utils.getCaseInsensitveFile(zip, file);
        const imgBlob = await img.async("blob");
        const imgUrl = URL.createObjectURL(imgBlob);
        images[id.toLowerCase()] = { file, gammagroup, h, w, x, y, imgUrl };
        break;
      }
      case "truetypefont": {
        //console.log(element);
        break;
      }
      default: {
        // console.error(`Unknown node ${node.name}`);
      }
    }
    return node;
  });

  // Gross hack returing a tuple here. We're just doing some crazy stuff to get
  // some data returned in the laziest way possible
  return [skinXml, images];
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
    console.warn("Got a Layouer without a background. Rendering null", id);
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
  return (
    <>
      <img
        data-node-type="Layer"
        data-node-id={id}
        src={img.imgUrl}
        style={{ position: "absolute", top: Number(y), left: Number(x) }}
      />
      {children}
    </>
  );
}

function Button({ id, image, action, x, y, downImage, tooltip, children }) {
  const data = React.useContext(SkinContext);
  const [down, setDown] = React.useState(false);
  const imgId = down ? downImage : image;
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
        backgroundPositionx: -Number(img.y),
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
  return <Button {...props} />;
}

const NODE_NAME_TO_COMPONENT = {
  layout: Layout,
  layer: Layer,
  button: Button,
  togglebutton: ToggleButton,
};

// Given a skin XML node, pick which component to use, and render it.
function XmlNode({ node }) {
  const attributes = node.attributes;
  if (attributes && IGNORE_IDS.has(attributes.id)) {
    return null;
  }
  if (node.name == null) {
    // This is likely a comment
    return null;
  }
  const Component = NODE_NAME_TO_COMPONENT[node.name];
  const childNodes = node.children || [];
  const children = childNodes.map((childNode, i) => (
    <XmlNode key={i} node={childNode} />
  ));
  if (Component == null) {
    console.warn("Unknown node type", node.name);
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
  const [skinXml, images] = data;
  return (
    <SkinContext.Provider value={images}>
      <XmlNode
        node={
          // TODO: This is not quite right. Really we should only be rendering the
          // portion of the XML that is actually view code.
          // For now we just render the whole thing and ignore whatever we don't recognize
          skinXml.children[0]
        }
      />
    </SkinContext.Provider>
  );
}

export default App;
