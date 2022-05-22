export interface Options {
  /**
   * initial skin
   * Example: `skin: "assets/WinampModern566.wal",`
   */
  skin?: string;

  /**
   * initial music tracks
   * Example: `tracks: ["/assets/song1.mp3", "https://example.com/song2.mp3"]
   */
  tracks?: string[];
}

/**
 * I prefer of use interface, but failed because not understand ts syntax
 */
export interface IWebampModern {
  switchSkin(skinPath: string): void;
  playSong(songurl: string /* or track */): void;
  onLogMessage(callback: (message: string) => void);
}

/**
 * Temporary patch due failed of using inteface above
 */
export class WebAmpModern implements IWebampModern {
  constructor(parent: HTMLElement, options: Options = {}) {}

  switchSkin(skinPath: string): void {}

  playSong(songurl: string /* or track */): void {}

  onLogMessage(callback: (message: string) => void) {}
}
