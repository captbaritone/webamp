# Winamp Equalizer Preset Parser

Winamp allows you to save your equalizser settings to `.eqf` file. This package allows you to parse these files.

## Installation

    npm install --save winamp-eqf

## Ussage

    import {parser, creator} from 'winamp-eqf';

    // ... Get your .eqf or .q1 file as an ArrayBuffer
    const eqf = parser(eqfArrayBuffer);

    const eqfArrayBuffer = creator(eqf);

## API

### `parser(ArrayBuffer)`

#### Return value

```JavaScript
{
  "presets": [
    {
      "name": "Entry1",
      "preamp": 33, // 1-64
      "hz60": 64,   // 1-64
      "hz170": 64,  // ...
      "hz310": 64,
      "hz600": 64,
      "hz1000": 64,
      "hz3000": 64,
      "hz6000": 64,
      "hz12000": 64,
      "hz14000": 64,
      "hz16000": 64,
    },
    // Some files, such as winamp.q1, may contain multiple preset objects.
  ],
  "type": "Winamp EQ library file v1.1",
}
```

### `creator(eqfObject)`

#### Return Value: `ArrayBuffer`

`eqfObject` is an object with the same shape as that returned by `parser()`.



## Source Material

Starting with this spec found here: <http://www.perlmonks.org/bare/?node_id=584875>:

> I've taken a look at some EQF files that I made for the purpose. The format is apparently very simple:
> The file is 299 bytes long.
>
> It starts with a text header, which in my case, is 37 bytes long. It is, in double-quotish notation — note the control-Z character:
>
> Winamp EQ library file v1.1\cZ!--Entry1
>
> Next is a block of null bytes ("\0") up till the next, final part.
> The real data is stored in the last 11 bytes of the file: the last byte is for the general volume, the 10 bytes before that are for each of the 10 EQ controls, in ascending order: the first of these 10 for the deepest bass, the last one (right in front of the volume byte) is for the highest treble.
> The values are 0x20 in neutral position, and are reversed in value: 0x00 is maximum, 0x3F is minimum. So there are 31 positions below, and 31 32 levels above neutral.

Additionally, I got some info from [Darren Owen](https://twitter.com/The_DoctorO) via Twitter:

<https://twitter.com/The_DoctorO/status/856223002530373632>

> Not that i'm aware off as sadly documentation of things was never great. Looking at the link vs files in a hex editor it seems mostly right.

> The current 1.1 format should be fine as I don't believe the format has changed for a very long time :)

And then via direct message:

> Will do it here as I can type a bit more, but the only obvious thing wrong with the link is the signature assumption as it's not guaranteed to be 'entry1' As you can have multiple eq blocks in a file.

> If you've looked at winamp.q1 you should see multiple presets in that file which follow one after each other so the file signature (winamp.q1 or a specific *.eqf file) is "Winamp EQ library file v1.1\x1A!--" (pulled that out from the disassembler) it's then a 257 byte buffer (256 + null character to terminate correctly) then the 10 byte block relating to the eq sliders (need to double-check the range base) followed by the 1 byte for the preamp slider then if there's more presets in the file, they follow on immediately after with the name block looking at the preamp slider, -12dB = 0x3F, 0dB = 0x1F, 12dB = 0 (so a 0-63 range) that seems to be the same for the other sliders (and matches 1:1 with the sdk details) and I think that's it :) in the winamp.q1 file, the 'default' entry is either a flat preset or what's been saved after customisation (in-case you're wanting to mirror the native behaviour via the preset -> save -> default action)