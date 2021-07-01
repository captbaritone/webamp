## Running locally

Assuming you have [Yarn](https://yarnpkg.com/) installed:

```bash
cd packages/webamp-modern-2
yarn
yarn start
```

# TODO Next

- [ ] Figure out if global NULL is actually typed as INT in Maki. I suspect there is no NULL type, but only an INT who happens to be zero.
- [ ] GUI objects that are constructed by MAKI never get onInit called on them...
- [ ] Fix all `// FIXME`
- [ ] SystemObject.getruntimeversion
- [ ] SystemObject.getskinname
- [ ] Ensure only wrapped variables go on the stack
    - [ ] I suspect that this will require type-aware coersion
        Meanding we don't just always convert to number, but match the type coersion of Maki?
- [ ] What is the root node?
- [ ] Where do Layers actually go?
- [ ] Where are scripts initialized?
- [ ] When parsing skins, where is the root state accumulated?
- [ ] How do includes work when parsing skins? Do they create new context?

# TODO Some day

- [ ] Handle case (in)sensitivity of includes.
- [ ] Handle forward/backward slashes issues (if they exist)

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
