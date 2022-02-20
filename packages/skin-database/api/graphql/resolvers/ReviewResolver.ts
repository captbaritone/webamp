import { ReviewRow } from "../../../types";

export default class ReviewResolver {
  _model: ReviewRow;
  constructor(model: ReviewRow) {
    this._model = model;
  }
  reviewer() {
    return this._model.reviewer;
  }
  rating() {
    return this._model.review;
  }
}
