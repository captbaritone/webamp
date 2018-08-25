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
        artist: string,
        title: string,
    },

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
        url: string,
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
    availableSkins?: { url: string, name: string }[];

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
    filePickers?: [{
        /**
         * The name that will appear in the context menu.
         *
         * Example: `"My File Picker..."`
         */
        contextMenuName: string,

        /**
         * A function which returns a Promise that resolves to an array of `Track`s
         *
         * Example: `() => Promise.resolve([{ url: './rick_roll.mp3' }])`
         */
        filePicker: () => Promise<Track[]>,

        /**
         * Indicates if this options should be made available when the user is offline.
         */
        requiresNetwork: boolean,
    }];
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
    public onTrackDidChange(callback: (track: Track) => any): () => void;

    /**
     * A callback which will be called when Webamp is closed.
     *
     * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
     */
    public onClose(callback: () => any): () => void;

    /**
     * A callback which will be called when Webamp is minimized.
     *
     * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
     */
    public onMinimize(callback: () => any): () => void;
}
