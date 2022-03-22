import SkinModel from "../../../data/SkinModel";
import ClassicSkinResolver from "./ClassicSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";

export default class SkinResolver {
  constructor() {
    throw new Error("This is a stub.");
  }
  static fromModel(model: SkinModel) {
    if (model.getSkinType() === "MODERN") {
      return new ModernSkinResolver(model);
    } else {
      return new ClassicSkinResolver(model);
    }
  }
}
