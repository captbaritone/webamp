# Installation

Webamp can be installed from NPM or included via a script tag using a a free content delivery network (CDN) such as [unpkg](https://unpkg.com/).

:::warning
Keep in mind that if you choose to use a free CDN, that CDN may stop operating at any time. If possible, consider downloading the file and serving it from your own server.
:::

## Install via NPM

```bash
npm install --save webamp
```

From here you can import Webamp in your JavaScript code:

```js
import Webamp from "webamp/butterchurn";
// ... use Webamp here
```

## Import directly from a CDN

ES modules can be imported via URL directly inside a `<script type="module">` tag.

```html
<script type="module">
  import Webamp from "https://unpkg.com/webamp@^2/butterchurn";
  // ... use Webamp here
</script>
```
