import { PlaylistTrack, URLTrack } from "../../js/types"
export interface Playlist {
    name: String, id: Number
}
const playlists: Playlist[] = [];
export function getPlaylists(): Playlist[] {
    if (0 === playlists.length) {
        const parameters = new URLSearchParams(window.location.search);
        if (null !== parameters.get("u") && null !== parameters.get("s") && null !== parameters.get("t")) {
            const params = `u=${parameters.get("u")}&s=${parameters.get("s")}&t=${parameters.get("t")}`;
            const server = `https://${parameters.get("d") || window.location.hostname}/rest/`;
            fetch(`${server}getPlaylists.view?f=json&${params}`).then(res => {
                if (res.ok) {
                    res.json().then(lists => {
                        for (const e of lists['subsonic-response']['playlists']['playlist']) {
                            playlists.push({ name: e.name, id: e.id });
                        }
                        window.dispatchEvent(new Event("resize"));
                    });
                };
            });
        }
    }
    return playlists;
}
export async function getPlaylistTracks(id: Number): Promise<URLTrack[]> {
    const output: URLTrack[] = [];
    const parameters = new URLSearchParams(window.location.search);
    const server = `https://${parameters.get("d") || window.location.hostname}/rest/`;
    const params = `u=${parameters.get("u")}&s=${parameters.get("s")}&t=${parameters.get("t")}`;
    let res = await fetch(`${server}getPlaylist.view?f=json&id=${id}&${params}`);
    if (res.ok) {
        let lists = await res.json();
        for (const e of lists['subsonic-response']['playlist']['entry']) {
            output.push({
                duration: e.duration, defaultName: `${e.artist} - ${e.title}`,
                url: `${server}stream.view?id=${e.id}&${params}`,
                metaData: { artist: e.artist, title: e.title, album: e.album }
            });
        }
    }
    return output;
}
