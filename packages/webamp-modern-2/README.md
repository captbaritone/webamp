# TODO Next

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