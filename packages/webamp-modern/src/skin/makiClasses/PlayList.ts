import AUDIO_PLAYER from "../AudioPlayer";
// import BaseObject from "./BaseObject";
// import GuiObj from "./GuiObj";

// export default class PlayListGui extends GuiObj {
//   // static GUID = "";
//   static guid = "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}";
// }

export type Track = {
  url: string; // filename included
  metadata?: string; // http://forums.winamp.com/showthread.php?t=345521
  title?: string;
  rating?: number; // 0..5
};

/**
 * Non GUI element.
 * Hold tracs. 
 * It still exist (not interfered) when skin changed
 */
export class PlEdit {
  // taken from lib/pldir.mi
  static guid = "{345BEEBC-0229-4921-90BE-6CB6A49A79D9}";
  _tracks: Track[] = [];
  _currentIndex: number;
  _selection: number[] = [];

  //? ======= General PlEdit Information =======
  getnumtracks(): number {
    return this._tracks.length;
  }

  getcurrentindex(): number {
    return this._currentIndex;
  }

  getnumselectedtracks(): number {
    return this._selection.length;
  }

  getnextselectedtrack(i: number): number {
    const current = this._selection.indexOf(i);
    const next = this._selection[current + 1];
    return next;
  }

  //? ======= Manipulate PlEdit View =======
  // Scrolls the PL to the currently playling
  // item (mostly used with onKeyDown: space)
  showcurrentlyplayingtrack(): void {
    // return unimplementedWarning("showcurrentlyplayingtrack");
  }

  showtrack(item: number): void {
    // return unimplementedWarning("showtrack");
  }

  enqueuefile(file: string): void {
    const newTrack: Track = { url: file };
    this._tracks.push(newTrack);

    // set audio source if it is the first
    if(this._tracks.length==1) {
      this.playtrack(0)
    }
  }

  clear(): void {
    this._selection = [];
    this._tracks = [];
    this._currentIndex = -1;
  }

  removetrack(item: number): void {
    // return unimplementedWarning("removetrack");
  }

  swaptracks(item1: number, item2: number): void {
    // return unimplementedWarning("swaptracks");
  }

  moveup(item: number): void {
    // return unimplementedWarning("moveup");
  }

  movedown(item: number): void {
    // return unimplementedWarning("movedown");
  }

  moveto(item: number, pos: number): void {
    // return unimplementedWarning("moveto");
  }

  playtrack(item: number): void {
    // return unimplementedWarning("playtrack");
    AUDIO_PLAYER.setAudioSource(this._tracks[item].url);
  }

  getrating(item: number): number {
    return this._tracks[item].rating ?? 0;
  }

  setrating(item: number, rating: number): void {
    this._tracks[item].rating = rating;
  }

  gettitle(item: number): string {
    // return unimplementedWarning("gettitle");
  }

  getlength(item: number): string {
    // return unimplementedWarning("getlength");
  }

  getmetadata(item: number, metadatastring: string): string {
    // return unimplementedWarning("getmetadata");
  }

  getfilename(item: number): string {
    // return unimplementedWarning("getfilename");
  }

  onpleditmodified(): void {
    // return unimplementedWarning("onpleditmodified");
  }
}

export class PlDir {
  // taken from lib/pldir.mi
  static guid = "{61A7ABAD-7D79-41f6-B1D0-E1808603A4F4}";

  showcurrentlyplayingentry(): void {
    // return unimplementedWarning("showcurrentlyplayingentry");
  }

  getnumitems(): number {
    // return unimplementedWarning("getnumitems");
  }

  getitemname(item: number): string {
    // return unimplementedWarning("getitemname");
  }

  refresh(): void {
    // return unimplementedWarning("refresh");
  }

  renameitem(item: number, name: string): void {
    // return unimplementedWarning("renameitem");
  }

  enqueueitem(item: number): void {
    // return unimplementedWarning("enqueueitem");
  }

  playitem(item: number): void {
    // return unimplementedWarning("playitem");
  }
}
