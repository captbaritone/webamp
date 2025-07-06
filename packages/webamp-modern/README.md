## Running locally

Assuming you have [pnpm](https://pnpm.io/) installed:

```bash
cd packages/webamp-modern
pnpm
pnpm start
```

## Performance Improvements

- [ ] We could use CSS `filter` to try to improve the speed of switching gamma colors?
- [ ] We could use WebGL to try to improve the speed of switching gamma colors?
- [x] We could use some CSS techniques to avoid having to appply inline style to each BitmapFont character's DOM node.
- [ ] We should profile the parse phase to see what's taking time. Perhaps there's some sync image work that could be done lazily.
- [ ] Remove some paranoid validation in the VM.
- [ ] Consider throttling time updates coming from audio
- [ ] Attach method binding on script init.

# TODO Next

- [ ] Implement event-listner-pool for native `on('eventname')`. It will improves readability & speed
- [ ] Why doesn't scrolling work property in MMD3?
- [x] Implement proper color
    - [ ] Move gammacolor to GPU?
- [ ] Requires VM
    - [ ] Look at componentbucket (Where can I find the images)
    - [ ] How is the scroll window for colors supposed to work?
    - [ ] How is the position slider supposed to work?
- [ ] Standardize handling of different type condition permutations in interpreter
- [x] Implement EQ
- [ ] Implament global actions
    - [x] TOGGLE
    - [ ] MINIMIZE
- [x] Allow for skins which don't have gamma sets
- [ ] Figure out if global NULL is actually typed as INT in Maki. I suspect there is no NULL type, but only an INT who happens to be zero.
- [ ] Implement custom list instead of html `select`, so scrollbars can be rendered properly.
- [ ] Fix all `// FIXME`
- [ ] SystemObject.getruntimeversion
- [ ] SystemObject.getskinname
- [x] Handle clicking through transparent: Using css `clip-path`. ~~https://stackoverflow.com/questions/38487569/click-through-png-image-only-if-clicked-coordinate-is-transparent~~

# TODO Some day

- [ ] Handle case (in)sensitivity of includes.
- [ ] Handle forward/backward slashes issues (if they exist)
- [ ] Draw in few canvases instead of huge HTML Elements

## Known Bugs

- [ ] In GuiObj's handling of left click, it's possible for the y/x of the click event to fall outside of the element being clicked. To repro click just above the volume2 of MMD3. Y can be one pixel above the clientBoundingRect of the element. Why?

# Phases of Initialization

## Asset Parse

Starting with `skin.xml`, and inlining each `<include />` we parse XML. As we go, we initialize GUI objects and attach them to their parent. During this phase we also encounter other asset files like Maki script, images, and fonts. These are parsed as they are encountered and setaside into a look-aside table (Maki scripts might live in the tree...).

This phase is `async` since it may require reading files from zip or doing image/font manipulation which is inherently `async`.

## Object Initialization

Once all look-aside tables are populated, we notify all GUI objects to initialize themselves by propogating from the root of the tree to the leaves. Each node is reponsible for notifying its children. In this phase components pull images/scripts/fonts out of their look-aside tables. [Question: Could these just be lazy?]. At this point we also hook up any event bindings/hooks that exist in Maki.

## Maki Initialization

Once all nodes have been initialized, we trigger/dispatch `System.onScriptLoaded` for each Maki script.

## First paint

Now we can begin panting 
