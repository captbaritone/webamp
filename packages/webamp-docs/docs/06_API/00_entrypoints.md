# Entrypoints

The Webamp NPM library includes multiple pre-built bundles. This makes it easy to add Webamp to your project without having to configure a bundler or, if you are using a bundler, control the size of your initial bundle.

All bundles are minified ES modules with provided TypeScript types. For examples of how to use these entrypoints, see the [examples page](../04_examples.md).

The main bundles are exposed as the following [package entrypoints](https://nodejs.org/api/packages.html#package-entry-points):

## `webamp/butterchurn`

**Since** [v2.2.0](../12_changelog.md#220)

:::tip
This is the recommended entrypoint to use if you want a fully featured Webamp and are not particularly concerned about bundle size.
:::

This all-inclusive minified bundle has everything you need to enable all Webamp features, including the Milkdrop visualizer [Butterchurn](https://www.npmjs.com/package/butterchurn) and a collection of visualizer presets. It weighs in at about `520kB` minified and gzipped.

```ts
import Webamp from "webamp/butterchurn";
```

## `webamp/lazy`

:::warning
Using this entrypoint requires that you have a rather sophisticated bundler setup.
:::

This minified bundle omits three of Webamp's rather heavy dependencies which are generally not needed for initial render. By using this entrypoint you can optimize for very fast initial load while still ensuring all features work. It weighs in at about `200kB` minified and gzipped.

- [Butterchurn](https://www.npmjs.com/package/butterchurn) - the Milkdrop visualizer, needed only once the user starts playing a track with the Milkdrop window open.
- [JSZip](https://www.npmjs.com/package/jszip) - Use for parsing user-provided skin. Needed only once the users selects a non-default skin.
- [music-metadata](https://www.npmjs.com/package/music-metadata) - Used for reading ID3 tags and other metadata from audio files. Needed only when the user loads a track for which `metaData` and `duration` information has not been provided.

```ts
import Webamp from "webamp/lazy";
```

For instructions on how to use this entrypoint, see the [Bundle Size Guide](../07_guides/03_bundle-size.md).

## `webamp`

:::warning
In a future version of Webamp, this entrypoint will become an alias of `webamp/butterchurn`.
:::

For legacy reasons, this entrypoint is still available. It strikes a middle ground between the two entrypoints above. It includes JSZip and music-metadata, but does not include Butterchurn. This means that it can be used to create a Webamp instance with the Milkdrop visualizer disabled. It weighs in at about `300kB` minified and gzipped.

```ts
import Webamp from "webamp";
```
