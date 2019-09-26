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

  setfeed(feed_id: string) {
    Utils.unimplementedWarning("setfeed");
    return;
  }

  releasefeed() {
    Utils.unimplementedWarning("releasefeed");
    return;
  }

  onfeedchange(new_feeddata: string) {
    Utils.unimplementedWarning("onfeedchange");
    return;
  }
}
