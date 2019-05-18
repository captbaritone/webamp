# TODO

## Rewrite

Add color to index
Add tweet likes to index
Crawl/index IA view count

Handle case where search results area loading
Handle slow search

Define a Skin interface which has all skin data or dummy skin data with a loading function

## Blocking

- Figure out how to get prerendering to work for Facebook
  - Waiting on Netlify

# Future

- Add archive.org link?
- Scroll is not locked in overlay mode on ios
- Fix animation for about page overlay fade in
- "No results" page
- Setup Sentry
- Restore focus when leaving the modal
- Add keyboard navigation to table
- Detect dupe files
- Add a structured search: tags, author, quotes, -
- Ensure our skins are up to date
- Add a feature to let users controll zoom
- Let users browser text files in skins
- Link back to original source of skin?
- Sometimes there's extra space at the bottom. Like, the calculation for how much height will be needed is not quite right.
- Publish to GitHub - In the webamp repo?
- Search updates should replace query not add a new one to the history
- Link to open on Webamp
- Keyboard navigation? Previous and next skin when focused?
- Move images to CDN. Currently it's just s3 directly
- Disable Google Analytics in dev
- Make Webamp clean up after itself
- Use empty space when search is less than a page for hints
- Come up with a name
- Find the upper bound for text we can index
- music-metadata does not seem to work

## Requires a server

- Drag in a skin to upload!
  - We should detect if we have it or not
- Allow users to add tags/author info

## Future features

- Skin explorer
  - List files within the zip and let users download them
  - Special viewer for txt files and bmp files
