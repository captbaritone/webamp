import SkinModel from "../../../data/SkinModel";
import CommonSkinResolver from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";

export default class ModernSkinResolver
  extends CommonSkinResolver
  implements NodeResolver
{
  _model: SkinModel;
  __typename = "ModernSkin";
  async id() {
    return toId(this.__typename, this.md5());
  }
}
