# States

1. ~Lazy loading initial results~
2. Above the fold placeholders
3. Above the fold images
4. Scrolling existing placeholders
5. Scrolling unfetched placeholders
   Show random colors
6. Clicked scrollbar and went to the bottom of the page
7. Cliked an image

We should include the first ~100 results in the initial payload

Loading a set of search results

1. Include teh color and md5 in the results

Each segment should have a state:

- Loaded
- Loading
- Errored
- Not Requested

When we want to show a placeholder we:

- Check if we already have it
- If so, we show it
- If not, pick a random color, and then (asycn) we check which segment it would be in
- If that segement is loading, noop
- If the segment has not been requested, we request it and mark it as loading
- When a segment comes back, we update our state

When a user clicks a skin

- If the skin is loaded (we have the md5) we take the user to the permalink
- If the skin is not loaded, we check which segment it would be in
- If the segment has not yet been requested (unlikely, since it should have been requested when it came into view) we request it
- If the segment is loading, we await its completion.
- If 500ms passes before the load completes, we show a spinnner or something
- When the loading completes we take the user to the permalink

## Functions we'll need

- `getSegmentForIndex(i)`
- `getMd5ForIndex(i)` (syncronous, but may kick off an async action)
- `getColorForIndex(i)` (syncronus. May give a BS result if it does not have one right away, may kick off an async action)
- `getSegmentStatus(segmentId)`
- `awaitMd5ForIndex(i)`
