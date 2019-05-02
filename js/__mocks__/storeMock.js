import getStore from "../store";
import Emitter from "../emitter";
import media from "./mediaMock";

export default function mockGetStore() {
  return getStore(media, new Emitter());
}
