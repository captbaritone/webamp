BaseOverlay example:

```js
const [open, setOpen] = React.useState(false);
const [shouldAnimate, setShouldAnimate] = React.useState(false);
return (
  <>
    <button onClick={() => setOpen(o => !o)}>Toggle Overlay</button>
    {open && <BaseOverlay closeModal={() => setOpen(false)} />}
  </>
);
```

BaseOverlay example (animated):

```js
const [open, setOpen] = React.useState(false);
const [shouldAnimate, setShouldAnimate] = React.useState(false);
return (
  <>
    <button onClick={() => setOpen(o => !o)}>Toggle Overlay</button>
    {open && (
      <BaseOverlay closeModal={() => setOpen(false)} shouldAnimate={true} />
    )}
  </>
);
```
