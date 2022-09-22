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

## Deployment

The Skin Museum client is deployed using Netlify. See the `netlify.toml` file in this same directory for details about how that works. The Netlify site is configured to use this subdirectory as it's base directory.