# Automated Screenshots

## Setup

Clone the Winamp2-js repo:

```
git clone git@github.com:captbaritone/winamp2-js.git
```

Start Winamp2-js in dev mode:

```
cd winamp2-js
yarn install
npm start
```

Winamp2-js should now be running on your local port 8080.

Now, in a separate terminal:

```
cd experiments/automated_screenshots
yarn install
```

Place skins in `experiments/automated_screenshots/skins`. Subdirectories are fine, `.wsz` files will be searched for recursively.

```
npm start
```

Wait...

Find screenshots in `experiments/automated_screenshots/screenshots`.
