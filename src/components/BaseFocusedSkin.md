BaseFocusedSkin example:

```js
const [show, setShow] = React.useState(false);
const hash = "48bbdbbeb03d347e59b1eebda4d352d0";

<>
  <button onClick={() => setShow(true)}>Show Webamp</button>
  {show && (
    <BaseFocusedSkin
      hash={hash}
      skinData={{ fileName: "fake_filename.wsz" }}
      absolutePermalink={
        "https://skins.webamp.org/skin/48bbdbbeb03d347e59b1eebda4d352d0/Zelda_Amp_3.wsz/"
      }
      initialPosition={{ top: 100, left: 100 }}
    />
  )}
</>;
```
