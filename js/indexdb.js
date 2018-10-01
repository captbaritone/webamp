import IdbKvStore from "idb-kv-store";
import { throttle } from "./utils";
const LOCAL_STORAGE_KEY = "webamp_state";

export async function bindToIndexDB(webamp) {
  const localStore = new IdbKvStore("webamp_state_database");

  let previousSerializedState = null;
  try {
    previousSerializedState = await localStore.get(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to load the saves state from IndexDB", e);
  }

  if (previousSerializedState != null) {
    webamp.loadSerializedState(previousSerializedState);
  }

  async function persist() {
    const serializedState = webamp.getSerializedState();
    try {
      await localStore.set(LOCAL_STORAGE_KEY, serializedState);
    } catch (e) {
      console.log("Failed to save our state to IndexDB", e);
    }
  }

  webamp.onStateChange(throttle(persist, 1000));
}
