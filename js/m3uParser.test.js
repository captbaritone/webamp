import fs from "fs";
import path from "path";
import m3uParser from "./m3uParser";

test("Can parse a sample m3u file with headers", () => {
  const content = fs.readFileSync(
    path.join(__dirname, "__tests__/fixtures/sample.m3u"),
    "utf8"
  );

  expect(m3uParser(content)).toMatchInlineSnapshot(`
Object {
  "extended": true,
  "tracks": Array [
    Object {
      "duration": 168,
      "file": "test/01%20Ghosts%20I.mp3",
      "title": "01 Ghosts I.mp3",
    },
    Object {
      "duration": 196,
      "file": "test/02%20Ghosts%20I.mp3",
      "title": "02 Ghosts I.mp3",
    },
    Object {
      "duration": 230,
      "file": "test/03%20Ghosts%20I.mp3",
      "title": "03 Ghosts I.mp3",
    },
  ],
}
`);
});

test("Can parse a minimal m3u file", () => {
  const content = fs.readFileSync(
    path.join(__dirname, "__tests__/fixtures/minimal.m3u"),
    "utf8"
  );

  expect(m3uParser(content)).toMatchInlineSnapshot(`
Object {
  "extended": false,
  "tracks": Array [
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_02_Pozegnanie_z_Marta_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_03_Ptaki_ciernistych_krzewow_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_04_Nie_dam_rady_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_05_Swiat_jest_ciekawszy_gdy_cie_na_nim_nie_ma_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_06_Goracy_kwiat_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_07_Dzieci_uwielbiaja_bajki_na_dobranoc_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_08_Pociagnij_mnie_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_09_Valium_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_10_Chocby_skaly_sraly_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_11_Mile_zlego_poczatki_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_12_Miami_walc_czyli_czytanie_wedlug_swietego_krzysztofa_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_13_Niebieski_pokoj_64kb.mp3",
    },
    Object {
      "file": "http://www.archive.org/download/ffs07/FSS07_MIAMI_VICE_-_14_Seks_z_N_64kb.mp3",
    },
  ],
}
`);
});
