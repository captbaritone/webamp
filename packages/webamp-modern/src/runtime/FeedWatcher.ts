import MakiObject from "./MakiObject";
import * as Utils from "../utils";

export default class FeedWatcher extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "FeedWatcher";
  }

  setfeed(feed_id: string): number {
    return Utils.unimplementedWarning("setfeed");
  }

  releasefeed(): void {
    return Utils.unimplementedWarning("releasefeed");
  }

  onfeedchange(new_feeddata: string): void {
    return Utils.unimplementedWarning("onfeedchange");
  }
}
