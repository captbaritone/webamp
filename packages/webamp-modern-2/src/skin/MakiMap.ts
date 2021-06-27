import BaseObject from "./BaseObject";

export default class MakiMap extends BaseObject {
  loadmap(bitmapId: string) {}
  inregion(x: number, y: number): boolean {
    // TODO
    return true;
  }
  getvalue(x: number, y: number): number {
    // TODO
    return 12345;
  }

  /*
extern Int Map.getValue(int x, int y);
extern Int Map.getARGBValue(int x, int y, int channel); // requires wa 5.51 // channel: 0=Blue, 1=Green, 2=Red, 3=Alpha. if your img has a alpha channal the returned rgb value might not be exact
extern Boolean Map.inRegion(int x, int y);
extern Map.loadMap(String bitmapid);
extern Int Map.getWidth();
extern Int Map.getHeight();
extern Region Map.getRegion();
*/
}
