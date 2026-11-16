import reducer from "../reducers";
import { AppState } from "../types";
import { cropPlaylist } from "./playlist";

function stateWithTracks(ids: number[]): AppState {
  let state = reducer(undefined, { type: "@@init" } as any);
  for (const id of ids) {
    state = reducer(state, {
      type: "ADD_TRACK_FROM_URL",
      id,
      url: `https://example.com/${id}.mp3`,
    } as any);
  }
  return state;
}

describe("cropPlaylist", () => {
  it("removes every track that is not selected", () => {
    let state = stateWithTracks([1, 2, 3]);
    state = reducer(state, { type: "CLICKED_TRACK", index: 1 } as any);
    const dispatch = vi.fn();

    cropPlaylist()(dispatch, () => state, {} as any);

    expect(dispatch.mock.calls).toEqual([
      [{ type: "REMOVE_TRACKS", ids: [1, 3] }],
    ]);
  });

  it("does nothing when no track is selected", () => {
    const state = stateWithTracks([1, 2, 3]);
    const dispatch = vi.fn();

    cropPlaylist()(dispatch, () => state, {} as any);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
