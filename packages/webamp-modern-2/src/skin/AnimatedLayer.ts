import Layer from "./Layer";

export default class AnimatedLayer extends Layer {
  _currentFrame: number = 0;
  _frameCount: number = 0;
  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      default:
        return false;
    }
    return true;
  }
  getlength(): number {
    return this._frameCount;
  }
  gotoframe(framenum: number) {
    this._currentFrame = framenum;
  }
  getcurframe(): number {
    return this._currentFrame;
  }
  setstartframe(framenum: number) {
    // TODO
  }
  setendframe(framenum: number) {
    // TODO
  }
  setspeed(msperframe: number) {
    // TODO
  }
  play() {
    // TODO
  }
  pause() {
    // TODO
  }
  stop() {
    // TODO
  }
  isplaying(): boolean {
    // TODO
    return false;
  }

  /*
  extern AnimatedLayer.onPlay();
extern AnimatedLayer.onPause();
extern AnimatedLayer.onResume();
extern AnimatedLayer.onStop();
extern AnimatedLayer.onFrame(Int framenum);
extern AnimatedLayer.setAutoReplay(Boolean onoff);
extern Boolean AnimatedLayer.isPlaying();
extern Boolean AnimatedLayer.isPaused();
extern Boolean AnimatedLayer.isStopped();
extern Int AnimatedLayer.getDirection();
extern Boolean AnimatedLayer.getAutoReplay();
extern AnimatedLayer.setRealtime(Boolean onoff);
*/

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "AnimatedLayer");
  }
}
