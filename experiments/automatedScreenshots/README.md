# Automated Screenshots

## Setup

Clone the Webamp repo:

```
git clone git@github.com:captbaritone/webamp.git
```

Start Webamp in dev mode:

```
cd webamp
yarn install
npm start
```

Webamp should now be running on your local port 8080.

Now, in a separate terminal:

```
cd experiments/automated_screenshots
yarn install
```

Place skins in `experiments/automatedScreenshots/skins`. Subdirectories are fine, `.wsz` files will be searched for recursively.

```
npm start
```

Wait...

Find screenshots in `experiments/automatedScreenshots/screenshots`.
