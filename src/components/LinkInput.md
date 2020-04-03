LinkInput example:

```js
const [show, setShow] = React.useState(false);

<>
  {show ? (
    <LinkInput
      hide={() => setShow(false)}
      permalink={
        "https://skins.webamp.org/skin/48bbdbbeb03d347e59b1eebda4d352d0/Zelda_Amp_3.wsz/"
      }
    />
  ) : (
    <button onClick={() => setShow(true)}>Show Link</button>
  )}
</>;
```
