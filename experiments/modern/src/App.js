import React from "react";
import JSZip from "jszip";
import "./App.css";
import { xml2js } from "xml-js";

const SkinContext = React.createContext(null);

function promisify(func) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      func(...args, (err, data) => {
        if (err != null) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  };
}

async function getSkin() {
  const resp = await fetch(process.env.PUBLIC_URL + "/CornerAmp_Redux.wal");
  const blob = await resp.blob();
  const zip = await JSZip.loadAsync(blob);
  const player = zip.file("xml/player-elements.xml");
  const xml = await player.async("text");

  const elementsDoc = await xml2js(xml, {
    compact: false,
    elementsKey: "children",
  });

  console.log(zip.files);

  const images = {};
  // TODO: Clearly more complicated than it needed to be.
  const elements = elementsDoc.children[0].children;
  for (const element of elements) {
    switch (element.name) {
      case "bitmap": {
        const { file, gammagroup, h, id, w, x, y } = element.attributes;
        // TODO: Escape file for regex
        const img = zip.file(new RegExp(file, "i"))[0];
        const imgBlob = await img.async("blob");
        const imgUrl = URL.createObjectURL(imgBlob);
        images[id.toLowerCase()] = { file, gammagroup, h, w, x, y, imgUrl };
        break;
      }
      case "truetypefont": {
        console.log(element);
        break;
      }
      default: {
        console.error(`Unknonw node ${element.name}`);
      }
    }
  }
  return images;
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
  const image = data[background];
  return (
    <>
      <img
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
  const img = data[image.toLowerCase()];
  return (
    <>
      <img
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
  // TODO: These seem to be switching too fast
  const img = data[imgId.toLowerCase()];
  return (
    <div
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

function App() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    getSkin().then(setData);
  }, []);
  if (data == null) {
    return <h1>Loading...</h1>;
  }
  return (
    <SkinContext.Provider value={data}>
      <div style={{ position: "relative" }}>
        <Layout background="player.bg">
          <Layer image="player.bg1" />
          <Layer id="Title1" x="0" y="92" image="Title1" move="0" />
          {/* 
          <Layer id="Title2" x="180" y="92" image="Title2" move="0" />
          <Layer id="Title3" x="0" y="42" image="Title3" move="0" />
          <Layer id="Title4" x="181" y="35" image="Title4" move="0" />
          */}
          <Button
            id="Previous"
            action="PREV"
            x="13"
            y="183"
            image="player.button.previous"
            downImage="player.button.previous.pressed"
            tooltip="Previous"
          />
          <Button
            id="Play"
            action="PLAY"
            x="37"
            y="142"
            image="player.button.play"
            downImage="player.button.play.pressed"
            tooltip="Play"
          />
          <Button
            id="Pause"
            action="PAUSE"
            x="66"
            y="102"
            image="player.button.pause"
            downImage="player.button.pause.pressed"
            tooltip="Pause"
          />
          <Button
            id="Stop"
            action="STOP"
            x="104"
            y="65"
            image="player.button.stop"
            downImage="player.button.stop.pressed"
            tooltip="Stop"
          />
          <Button
            id="Next"
            action="NEXT"
            x="148"
            y="36"
            image="player.button.next"
            downImage="player.button.next.pressed"
            tooltip="Next"
          />
          <Button
            id="Eject"
            action="EJECT"
            x="198"
            y="14"
            image="player.button.eject"
            downImage="player.button.eject.pressed"
            tooltip="Eject"
          />

          <ToggleButton
            id="Repeat"
            x="136"
            y="-15"
            image="player.toggler.repeat.disabled"
            downImage="player.toggler.repeat.pressed"
            activeImage="player.toggler.repeat.enabled"
            tooltip="Repeat"
            cfgattrib="{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Repeat"
            cfgval="2"
          />
          <ToggleButton
            id="Crossfade"
            x="78"
            y="-1"
            image="player.toggler.crossfade.disabled"
            downImage="player.toggler.crossfade.pressed"
            activeImage="player.toggler.crossfade.enabled"
            tooltip="Crossfade"
            cfgattrib="{FC3EAF78-C66E-4ED2-A0AA-1494DFCC13FF};Enable crossfading"
          />
          <ToggleButton
            id="Shuffle"
            x="109"
            y="-1"
            image="player.toggler.shuffle.disabled"
            downImage="player.toggler.shuffle.pressed"
            activeImage="player.toggler.shuffle.enabled"
            tooltip="Shuffle"
            cfgattrib="{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D};Shuffle"
          />
          <Button
            id="eq"
            action="TOGGLE"
            param="eq"
            x="0"
            y="-1"
            image="player.switch.eq.disabled"
            downImage="player.switch.eq.pressed"
            activeImage="player.switch.eq.enabled"
            tooltip="Toggle Equalizer"
          />
          <Button
            id="ml"
            action="TOGGLE"
            param="guid:ml"
            x="25"
            y="-1"
            image="player.switch.ml.disabled"
            downImage="player.switch.ml.pressed"
            activeImage="player.switch.ml.enabled"
            tooltip="Toggle Music Library"
          />
          <Button
            id="pl"
            action="TOGGLE"
            param="guid:pl"
            x="51"
            y="-1"
            image="player.switch.playlist.disabled"
            downImage="player.switch.playlist.pressed"
            activeImage="player.switch.playlist.enabled"
            tooltip="Toggle Playlist Editor"
          />
        </Layout>
      </div>
    </SkinContext.Provider>
  );
  return (
    <div className="App">
      <table>
        <tbody>
          {data &&
            Object.entries(data).map(([key, image]) => {
              let imgElement = null;
              if (image.w || image.h) {
                imgElement = (
                  <div
                    style={{
                      backgroundPositionX: -Number(image.x),
                      backgroundPositionx: -Number(image.y),
                      width: Number(image.w),
                      height: Number(image.h),
                      backgroundImage: `url(${image.imgUrl})`,
                    }}
                  />
                );
              } else {
                imgElement = <img src={image.imgUrl} />;
              }
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    <pre>{JSON.stringify(image, null, 2)}</pre>
                  </td>
                  <td>{imgElement}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
