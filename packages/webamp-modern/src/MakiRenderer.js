import React, { useEffect, useReducer } from "react";
import "./App.css";
import * as Utils from "./utils";

function useJsUpdates(makiObject) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
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
      onMouseDown={(e) =>
        handleMouseButtonEventDispatch(
          makiObject,
          e,
          "onLeftButtonDown",
          "onRightButtonDown"
        )
      }
      onDoubleClick={(e) =>
        handleMouseButtonEventDispatch(
          makiObject,
          e,
          "onLeftButtonDblClk",
          "onRightButtonDblClk"
        )
      }
      onMouseMove={(e) =>
        handleMouseEventDispatch(makiObject, e, "onMouseMove")
      }
      onMouseEnter={(e) =>
        handleMouseEventDispatch(makiObject, e, "onEnterArea")
      }
      onMouseLeave={(e) =>
        handleMouseEventDispatch(makiObject, e, "onLeaveArea")
      }
      onDragEnter={() => makiObject.js_trigger("onDragEnter")}
      onDragLeave={() => makiObject.js_trigger("onDragLeave")}
      onDragOver={(e) => handleMouseEventDispatch(makiObject, e, "onDragOver")}
      onKeyUp={(e) => makiObject.js_trigger("onKeyUp", e.keyCode)}
      onKeyDown={(e) => makiObject.js_trigger("onKeyDown", e.keyCode)}
      onContextMenu={(e) => {
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
  const { id, js_assets, image, x, y, w, h } = makiObject.attributes;
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
  if (w !== undefined) {
    params.width = Number(w);
  } else if (img.w !== undefined) {
    params.width = Number(img.w);
  }
  if (h !== undefined) {
    params.height = Number(h);
  } else if (img.h !== undefined) {
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
        onClick={(e) => {
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

  const children = makiObject.js_getCommands().map((item) => {
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
  let fontFamily;
  if (font) {
    const js_attributes = makiObject.js_fontLookup(font.toLowerCase());
    fontFamily = js_attributes == null ? null : js_attributes.fontFamily;
  }
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

// Given a Maki object, pick which component to use, and render it.
export const Maki = React.memo(({ makiObject }) => {
  useJsUpdates(makiObject);
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
  const Component = NODE_NAME_TO_COMPONENT[name] || DummyComponent;
  return <Component makiObject={makiObject} />;
});
