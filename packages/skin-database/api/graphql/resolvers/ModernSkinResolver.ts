import SkinModel from "../../../data/SkinModel";
import CommonSkinResolver from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import path from "path";

export default class ModernSkinResolver
  extends CommonSkinResolver
  implements NodeResolver
{
  _model: SkinModel;
  __typename = "ModernSkin";
  async id() {
    return toId(this.__typename, this.md5());
  }
  async filename(normalize_extension = false) {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wal";
    }
    return filename;
  }
}
