interface TrackInfo {
  /**
   * Name to be used until ID3 tags can be resolved.
   *
   * If the track has a `url`, and this property is not given,
   * the filename will be used instead.
   *
   * Example: `'My Song'`
   */
  defaultName?: string;

  /**
   * Data to be used _instead_ of trying to fetch ID3 tags.
   *
   * Example: `{ artist: 'Jordan Eldredge', title: "Jordan's Song" }`
   */
  metaData?: {
    artist: string;
    title: string;
    album?: string;
  };

  /**
   * Duration (in seconds) to be used instead of fetching enough of the file to measure its length.
   *
   * Example: 95
   */
  duration?: number;
}

interface URLTrack extends TrackInfo {
  /**
   * Source URL of the track
   *
   * Note: This URL must be served the with correct CORs headers.
   *
   * Example: `'https://example.com/song.mp3'`
   */
  url: string | URL;
}

interface BlobTrack extends TrackInfo {
  /**
   * Blob source of the track
   */
  blob: Blob;
}

interface LoadedURLTrack {
  url: string;
  metaData: {
    artist: string | null;
    title: string | null;
    album: string | null;
    albumArtUrl: string | null;
  };
}

/**
 * Many methods on the webamp instance deal with track.
 *
 * Either `url` or `blob` must be specified
 */
type Track = URLTrack | BlobTrack;

interface Options {
  /**
   * An object representing the initial skin to use.
   *
   * If omitted, the default skin, included in the bundle, will be used.
   * Note: This URL must be served the with correct CORs headers.
   *
   * Example: `{ url: './path/to/skin.wsz' }`
   */
  initialSkin?: {
    url: string;
  };

  /**
   * An array of `Track`s to prepopulate the playlist with.
   */
  initialTracks?: Track[];

  /**
   * An array of objects representing available skins.
   *
   * These will appear in the "Options" menu under "Skins".
   * Note: These URLs must be served with the correct CORs headers.
   *
   * Example: `[ { url: "./green.wsz", name: "Green Dimension V2" } ]`
   */
  availableSkins?: { url: string; name: string }[];

  /**
   * Should global hotkeys be enabled?
   *
   * Default: `false`
   */
  enableHotkeys?: boolean;

  /**
   * An array of additional file pickers.
   *
   * These will appear in the "Options" menu under "Play".
   *
   * In the offical version, this option is used to provide a "Dropbox" file picker.
   */
  filePickers?: [
    {
      /**
       * The name that will appear in the context menu.
       *
       * Example: `"My File Picker..."`
       */
      contextMenuName: string;

      /**
       * A function which returns a Promise that resolves to an array of `Track`s
       *
       * Example: `() => Promise.resolve([{ url: './rick_roll.mp3' }])`
       */
      filePicker: () => Promise<Track[]>;

      /**
       * Indicates if this options should be made available when the user is offline.
       */
      requiresNetwork: boolean;
    }
  ];
  zIndex?: number;

  handleTrackDropEvent?: (
    e: React.DragEvent<HTMLDivElement>
  ) => Track[] | null | Promise<Track[] | null>;
}

export default class Webamp {
  constructor(options: Options);

  /**
   * Returns a true if the current browser supports the features that Webamp depends upon.
   *
   * It is recommended to check this before you attempt to instantiate an instance of Winamp.
   */
  public static browserIsSupported(): boolean;

  /**
   * Add an array of `Track`s to the end of the playlist.
   */
  public appendTracks(tracks: Track[]): void;

  /**
   * Replace the playlist with an array of `Track`s and begin playing the first track.
   */
  public setTracksToPlay(tracks: Track[]): void;

  /**
   * Play the previous track
   */
  public previousTrack(): void;

  /**
   * Play the next track
   */
  public nextTrack(): void;

  /**
   * Seek forward n seconds in the curent track
   */
  public seekForward(seconds: number): void;

  /**
   * Seek backward n seconds in the curent track
   */
  public seekBackward(seconds: number): void;

  /**
   * Seek to a given time within the current track
   */
  public seekToTime(seconds: number): void;

  /**
   * Pause the current tack
   */
  public pause(): void;

  /**
   * Play the current tack
   */
  public play(): void;

  /**
   * Stop the currently playing audio. Equivilant to pressing the "stop" button
   */
  public stop(): void;

  /**
   * Webamp will wait until it has fetched the skin and fully parsed it and then render itself.
   *
   * Webamp is rendered into a new DOM node at the end of the <body> tag with the id `#webamp`.
   *
   * If a domNode is passed, Webamp will place itself in the center of that DOM node.
   *
   * @returns A promise is returned which will resolve after the render is complete.
   */
  public renderWhenReady(domNode: HTMLElement): Promise<void>;

  /**
   * A callback which will be called when a new track starts loading.
   *
   * This can happen on startup when the first track starts buffering, or when a subsequent track starts playing.
   * The callback will be called with an object `({url: 'https://example.com/track.mp3'})` containing the URL of the track.
   * Note: If the user drags in a track, the URL may be an ObjectURL.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  public onTrackDidChange(
    cb: (trackInfo: LoadedURLTrack | null) => void
  ): () => void;

  /**
   * Get the current "playing" status.
   */
  public getMediaStatus(): "PLAYING" | "STOPPED" | "PAUSED";

  /**
   * A callback which will be called when Webamp is _about to_ close. Returns an
   * "unsubscribe" function. The callback will be passed a `cancel` function
   * which you can use to conditionally prevent Webamp from being closed.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  public onWillClose(cb: (cancel: () => void) => void): () => void;

  /**
   * A callback which will be called when Webamp is closed.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  public onClose(cb: () => void): () => void;

  /**
   * Equivalent to selection "Close" from Webamp's options menu. Once closed,
   * you can open it again with `.reopen()`.
   */
  public close(): void;

  /**
   * After `.close()`ing this instance, you can reopen it by calling this method.
   */
  public reopen(): void;

  /**
   * A callback which will be called when Webamp is minimized.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  public onMinimize(callback: () => any): () => void;

  public setSkinFromUrl(url: string): void;

  /**
   * Returns a promise that resolves when the skin is done loading.
   */
  public skinIsLoaded(): Promise<void>;

  /**
   * **Note:** _This method is not fully functional. It is currently impossible to
   * clean up a Winamp instance. This method makes an effort, but it still leaks
   * the whole instance. In the future the behavior of this method will improve,
   * so you might as well call it._
   *
   * When you are done with a Webamp instance, call this method and Webamp will
   * attempt to clean itself up to avoid memory leaks.
   */
  public dispose(): void;
}
