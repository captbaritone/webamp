# Winamp Skin Museum Client

This package is the client for the Winamp Skin Museum. It is a React/Redux/RXJS application that uses the GraphQL API provided by the `skin-database` package in this same repository.

## Development

```bash
cd packages/skin-museum-client
yarn
# Run this at least once to ensure the local version of Webamp has been built.
yarn build-webamp
yarn start
```

By default the client will connect to the production API. This works great for client-only changes. If you need to make changes which span both the client and the server, you will need to make some changes.

Start the server locally:

```bash
cd pacakges/skin-database
yarn
yarn start
```

This should start the server on port 3001.

Now update the `API_URL` constant in `src/constants.js` to `"http://localhost:3001"`. This will tell the client to connect to the local server instead of the production API.

Finally, in a separate terminal, start the client as outlined at the top of this section.

## Deployment

The Skin Museum client is deployed using Netlify. See the `netlify.toml` file in this same directory for details about how that works. The Netlify site is configured to use this subdirectory as it's base directory.