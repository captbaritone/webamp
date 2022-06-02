import { assume, Emitter, integerToTime } from "../../utils";
import AUDIO_PLAYER, { Track } from "../AudioPlayer";
// import * as musicMetadata from 'music-metadata-browser';
import { parse } from "id3-parser";
import { convertFileToBuffer, fetchFileAsBuffer } from 'id3-parser/lib/universal/helpers';
import { parseMetaData } from "../AudioMetadata";

// import * as jsmediatags from 'jsmediatags';



/**
 * Non GUI element.
 * Hold tracs.
 * It still exist (not interfered) when skin changed
 */
export class PlEdit {
  static GUID = "345beebc49210229b66cbe90d9799aa4";
  // taken from lib/pldir.mi
  static guid = "{345BEEBC-0229-4921-90BE-6CB6A49A79D9}";
  _tracks: Track[] = [];
  _trackCounter:number=1;
  _currentIndex: number = -1;
  _selection: number[] = [];
  _eventListener: Emitter = new Emitter();

  // shortcut of this.Emitter
  on(event: string, callback: Function): Function {
    return this._eventListener.on(event, callback);
  }
  trigger(event: string, ...args: any[]) {
    this._eventListener.trigger(event, ...args);
  }
  off(event: string, callback: Function) {
    this._eventListener.off(event, callback);
  }

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

  addTrack(track: Track) {
    if(!track.id){
      this._trackCounter++;
      track.id = this._trackCounter;
    }
    this._tracks.push(track);

    // set audio source if it is the first
    if (this._tracks.length == 1) {
      this.playtrack(0);
    }

    this.trigger("trackchange"); //TODO: why is this neeeded here

    if(!track.metadata){
      parseMetaData(track, ()=>{
        this.trigger("trackchange")
      })
    }
  }

  enqueuefile(file: string): void {
    const newTrack: Track = { filename: file };
    this.addTrack(newTrack);
  }

  clear(): void {
    this._selection = [];
    this._tracks = [];
    this._currentIndex = null;
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
    this._currentIndex = item;
    const track = this._tracks[item];
    const url = track.file ? URL.createObjectURL(track.file) : track.filename;
    AUDIO_PLAYER.setAudioSource(url);
    this.trigger("trackchange");
  }

  getCurrentTrackTitle(): string {
    if (this._currentIndex < 0) {
      return "";
    }
    return this.gettitle(this._currentIndex);
  }

  getrating(item: number): number {
    return this._tracks[item].rating ?? 0;
  }

  setrating(item: number, rating: number): void {
    this._tracks[item].rating = rating;
  }

  gettitle(item: number): string {
    const track = this._tracks[item];
    if(track.metadata){
      return `${track.metadata.artist} - ${track.metadata.title}`
    }
    return this._tracks[item].filename.split("/").pop();
  }
  
  getlength(item: number): string {
    return integerToTime(this._tracks[item].duration || 0);
    // return unimplementedWarning("getlength");
  }

  // getmetadata(item: number, metadatastring: string): string {
  //   // return unimplementedWarning("getmetadata");
  // }

  // getfilename(item: number): string {
  //   // return unimplementedWarning("getfilename");
  // }

  onpleditmodified(): void {
    // return unimplementedWarning("onpleditmodified");
  }

  // async fetchMediaDuration(track: Track, callback: Function):Promise<void> {
  //   try {
  //     const audioTrackUrl = track.file ? URL.createObjectURL(track.file) : track.filename;
  //     track.duration = await genMediaDuration(audioTrackUrl);

  //     // const options = {
  //     //   duration: true,
  //     //   skipPostHeaders: true, // avoid unnecessary data to be read
  //     // };
  //     // // const metadata = await musicMetadata.fetchFromUrl(audioTrackUrl, options);
  //     // // console.log('mm-meta:', metadata)
  //     // musicMetadata.fetchFromUrl(audioTrackUrl, options).then((metadata)=>{
  //     //   console.log('mm-meta:', metadata)
  //     // });
  //     fetchFileAsBuffer(audioTrackUrl).then(parse).then(tag => {
  //       console.log('id3:',tag);
  //     });
  //     callback()
  //   } catch (e) {
  //     // TODO: Should we update the state to indicate that we don't know the length?
  //     console.warn('ERROR:',e)
  //   }
  // }
}


export class PlDir {
  static GUID = "61a7abad41f67d7980e1d0b1f4a40386";
  // taken from lib/pldir.mi
  static guid = "{61A7ABAD-7D79-41f6-B1D0-E1808603A4F4}";

  showcurrentlyplayingentry(): void {
    // return unimplementedWarning("showcurrentlyplayingentry");
  }

  // getnumitems(): number {
  //   // return unimplementedWarning("getnumitems");
  // }

  // getitemname(item: number): string {
  //   // return unimplementedWarning("getitemname");
  // }

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
