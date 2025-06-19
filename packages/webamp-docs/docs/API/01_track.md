# Track Type

Many methods on the webamp instance deal with `Track`s. Here is the shape of a `Track`:

:::warning
**The `url` must be served with the [correct CORS headers](../guides/01_cors.md).**
:::

```ts
const track = {
  // Either `url` or `blob` must be specified
  // Note: This URL must be served the with correct CORs headers.
  url: "https://example.com/song.mp3",
  blob: dataBlob,

  // Optional. Name to be used until ID3 tags can be resolved.
  // If the track has a `url`, and this property is not given,
  // the filename will be used instead.
  defaultName: "My Song",

  // Optional. Data to be used _instead_ of trying to fetch ID3 tags.
  // **WARNING** If you omit this data, Webamp will fetch the first
  // few bytes of this file on load to try to read its id3 tags.
  metaData: {
    artist: "Jordan Eldredge",
    title: "Jordan's Song",
  },

  // Optional. Duration (in seconds) to be used instead of
  // fetching enough of the file to measure its length.
  // **WARNING** If you omit this property, Webamp will fetch the first
  // few bytes of this file on load to try to determine its duration.
  duration: 95,
};
```
