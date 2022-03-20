import AUDIO_PLAYER from "../AudioPlayer";
import Layer from "./Layer";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Clayer.2F.3E
export default class AlbumArt extends Layer {
  static GUID = "6dcb05e448c28ac4f04993b14af50e91";
  
  constructor(){
    super();
    this._width = 0;
    this._height = 0;
    this._relatw ='1';
    this._relath ='1';
  }
  draw(){ 
    super.draw()

    // const trackInfo = AUDIO_PLAYER._trackInfo;
    // const base64 = btoa(String.fromCharCode.apply(null, trackInfo.picture.data));
    // const url = `url(data:${trackInfo.picture.format};base64,${base64})`;
    const url = `url(${AUDIO_PLAYER._albumArtUrl})`;


    this._div.style.pointerEvents = 'all';
    this._div.style.backgroundImage = url;
    this._div.style.backgroundSize = 'cover';
    // this._div.style.setProperty('--album-art','loaded')
    // this._div.style.setProperty('--album-img',url)
    // `url(${AUDIO_PLAYER._trackInfo.picture.base64})`;
  }

  refresh() {
    //TODO
  }

  isloading(): number {
    return 1;
  }

  onAlbumArtLoaded(success:boolean){
    return true; //TODO 
  }

}
