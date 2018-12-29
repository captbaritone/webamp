import IdbKvStore from "idb-kv-store";
import { throttle } from "../../js/utils";
const LOCAL_STORAGE_KEY = "webamp_state";

export async function bindToIndexedDB(webamp, clearState, useState) {
  if (!useState) {
    return;
  }
  const localStore = new IdbKvStore("webamp_state_database");

  if (clearState) {
    try {
      await localStore.clear();
    } catch (e) {
      console.log("Failed to clear our IndexeddB state", e);
    }
  }

  let previousSerializedState = null;
  try {
    previousSerializedState = await localStore.get(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to load the saved state from IndexedDB", e);
  }

  if (previousSerializedState != null) {
    webamp.__loadSerializedState(previousSerializedState);
  }

  async function persist() {
    const serializedState = webamp.__getSerializedState();
    try {
      await localStore.set(LOCAL_STORAGE_KEY, serializedState);
    } catch (e) {
      console.log("Failed to save our state to IndexedDB", e);
    }
  }

  webamp.__onStateChange(throttle(persist, 1000));
}
