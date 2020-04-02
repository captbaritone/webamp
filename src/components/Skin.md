Skin example:

```js
import * as Utils from "../utils";

const [position, setPosition] = React.useState(null);
const hash = "48bbdbbeb03d347e59b1eebda4d352d0";
const scale = 0.5;
const height = 348 * scale;
const width = 275 * scale;
const color = "rgb(67, 99, 96)";
<>
  <Skin
    style={{ width, height }}
    href={`https://webamp.org/?skinUrl=https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`}
    src={Utils.screenshotUrlFromHash(hash)}
    key={hash}
    hash={hash}
    height={height}
    width={width}
    selectSkin={(hash, pos) => setPosition(pos)}
    color={color}
    // TODO: This is werid because there is an implicit assumption that this is always avaliable if we have the skin
    permalink={""}
  />
  {position != null && (
    <>
      X/Y Click Position: {position.left}/{position.top}
    </>
  )}
</>;
```
