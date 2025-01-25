import Task from "./ITask";
import * as Skins from "../data/skins";

export default class DeleteSkin extends Task {
  async run(): Promise<void> {
    await Skins.deleteSkin(md5);
  }
}
