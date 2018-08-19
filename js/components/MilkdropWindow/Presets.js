function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}
function getRandomValue(arr) {
  return arr[getRandomIndex(arr)];
}

function getLast(arr) {
  return arr[arr.length - 1];
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(e) {
      reject(e);
    };

    reader.readAsText(file);
  });
}

/**
 * Track a collection of async loaded presets
 *
 * Presets can be changed via `next`, `previous` or `selectIndex`. In each case,
 * a promise is returned. If the promise resolves to `null` it means the
 * selection was canceled by a subsequent request before it could be fulfilled.
 * If the request is successful, the promise resolves to the selected preset.
 *
 * We assume a model where some portion of the preset are supplied at initialization
 * and the remainder can be loaded async via the function `getRest`.
 */
export default class Presets {
  constructor({ keys, initialPresets, getRest, randomize = true }) {
    this._keys = keys; // Alphabetical list of preset names
    this._presets = initialPresets; // Presets indexed by name
    this._getRest = getRest; // An async function to get the rest of the presets
    this._history = []; // Indexes into _keys

    this._randomize = randomize;

    // Initialize with a key that we already have.
    const avaliableKeys = Object.keys(initialPresets);
    const currentKey = randomize
      ? getRandomValue(avaliableKeys)
      : avaliableKeys[0];
    this._currentIndex = this._keys.indexOf(currentKey);
    this._history.push(this._currentIndex);
  }

  toggleRandomize() {
    this._randomize = !this._randomize;
  }

  setRandomize(val) {
    this._randomize = val;
  }

  addPresets(presets) {
    const startIdx = this._keys.length;
    this._keys = this._keys.concat(Object.keys(presets));
    const endIndx = this._keys.length;

    this._presets = Object.assign(this._presets, presets);

    return [startIdx, endIndx];
  }

  async next() {
    let idx;
    if (this._randomize || this._history.length === 0) {
      idx = getRandomIndex(this._keys);
    } else {
      idx = (getLast(this._history) + 1) % this._keys.length;
    }
    this._history.push(idx);
    return this._selectIndex(idx);
  }

  async previous() {
    if (this._history.length > 1) {
      this._history.pop();
      return this._selectIndex(getLast(this._history));
    }
    // We are at the very beginning. There is no "previous" preset.
    return Promise.resolve();
  }

  async selectIndex(idx) {
    // The public version of this method must add to the history
    this._history.push(idx);
    return this._selectIndex(idx);
  }

  async _convertPreset(file) {
    return new Promise((resolve, reject) => {
      require.ensure(
        ["milkdrop-preset-converter-aws"],
        async require => {
          const { convertPreset } = require("milkdrop-preset-converter-aws");
          try {
            resolve(convertPreset(file));
          } catch (e) {
            reject(e);
          }
        },
        reject,
        "milkdrop-preset-converter"
      );
    });
  }

  async _selectIndex(idx) {
    const preset = this._presets[this._keys[idx]];
    if (!preset) {
      const rest = await this._getRest();
      this._presets = Object.assign(this._presets, rest);
      if (getLast(this._history) !== idx) {
        // This selection must be obsolete. Return null so that
        // the caller knows this request got canceled.
        return null;
      }
    }
    if (preset && preset.file) {
      try {
        const fileContents = await readFileAsText(preset.file);
        const convertedPreset = await this._convertPreset(fileContents);
        this._presets[this._keys[idx]] = convertedPreset;
      } catch (e) {
        console.error(e);
        alert(`Unable to convert MilkDrop preset ${this._keys[idx]}`);
      }
    }
    this._currentIndex = idx;
    return this.getCurrent();
  }

  getKeys() {
    return this._keys;
  }

  getCurrentIndex() {
    return this._currentIndex;
  }

  getCurrent() {
    // #matryoshka
    return this._presets[this._keys[this._currentIndex]];
  }
}
