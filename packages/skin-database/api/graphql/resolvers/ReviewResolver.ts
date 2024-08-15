import { Ctx } from "..";
import { Rating, ReviewRow } from "../../../types";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";

/**
 * A review of a skin. Done either on the Museum's Tinder-style
 * reivew page, or via the Discord bot.
 * @gqlType Review */
export default class ReviewResolver {
  _model: ReviewRow;
  constructor(model: ReviewRow) {
    this._model = model;
  }

  /**
   * The skin that was reviewed
   * @gqlField
   */
  skin(args: unknown, { ctx }: Ctx): Promise<ISkin | null> {
    return SkinResolver.fromMd5(ctx, this._model.skin_md5);
  }

  /**
   * The user who made the review (if known). **Note:** In the early days we didn't
   * track this, so many will be null.
   * @gqlField
   */
  reviewer(): string {
    return this._model.reviewer;
  }
  /**
   * The rating that the user gave the skin
   * @gqlField
   */
  rating(): Rating {
    return this._model.review;
  }
}
