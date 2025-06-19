# Hotkeys

Webamp attempts to emulate the hotkeys of the original Winamp. This means that you can control playback and other features of Webamp using your keyboard.

## Enable hotkeys

If you want to display the hotkeys in the Webamp UI, you can pass the `enableHotkeys` option when initializing Webamp:

```ts
import Webamp from "webamp";

const webamp = new Webamp({
  enableHotkeys: true,
});

webamp.renderWhenReady(document.getElementById("winamp-container"));
```

## Hotkeys

| Key Combo | Action                  |
| --------- | ----------------------- |
| X         | Play                    |
| C         | Pause                   |
| V         | Stop                    |
| B         | Next Track              |
| Z         | Previous Track          |
| R         | Toggle Repeat           |
| S         | Toggle Shuffle          |
| L         | Open File Dialog        |
| ← (Left)  | Seek Backward (5s)      |
| → (Right) | Seek Forward (5s)       |
| ↑ (Up)    | Volume Up               |
| ↓ (Down)  | Volume Down             |
| Ctrl+D    | Toggle Double Size Mode |
| Ctrl+R    | Reverse Playlist        |
| Ctrl+T    | Toggle Time Mode        |
| Alt+W     | Toggle Main Window      |
| Alt+E     | Toggle Playlist Window  |
| Alt+G     | Toggle Equalizer Window |
| Numpad 0  | Open File Dialog        |
| Numpad 1  | Skip Backward 10 Tracks |
| Numpad 2  | Volume Down             |
| Numpad 3  | Skip Forward 10 Tracks  |
| Numpad 4  | Previous Track          |
| Numpad 5  | Play                    |
| Numpad 6  | Next Track              |
| Numpad 7  | Seek Backward (5s)      |
| Numpad 8  | Volume Up               |
| Numpad 9  | Seek Forward (5s)       |

## Easter Egg

Webamp emulates the original Winamp's Easter egg. If type "nullsoft", letter by letter, pressing `<esc>` after each letter "L" to dismiss the open file dialog, you will toggle Webamp into and out of "Easter Egg Mode". In this mode, a custom skin-defined title bar is shown in the main window.
