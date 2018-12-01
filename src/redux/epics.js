import { combineEpics } from "redux-observable";
import { of, from, empty } from "rxjs";
import { filter, switchMap, map } from "rxjs/operators";
import { search } from "../algolia";

const urlChangedEpic = actions =>
  actions.pipe(
    filter(action => action.type === "URL_CHANGED"),
    switchMap(action => {
      const params = new URLSearchParams(action.location.search);
      const query = params != null && params.get("query");

      if (action.location.pathname.startsWith("/skin/")) {
        const segments = action.location.pathname.split("/");
        return of({ type: "SELECTED_SKIN", hash: segments[2] });
      }
      if (query == null) {
        return empty();
      }
      return of({ type: "SEARCH_QUERY_CHANGED", query });
    })
  );

const searchEpic = actions =>
  actions.pipe(
    filter(action => action.type === "SEARCH_QUERY_CHANGED"),
    switchMap(({ query }) => {
      if (query.length === 0) {
        return of({
          type: "GOT_NEW_MATCHING_HASHES",
          matchingHashes: null
        });
      }

      return from(search(query)).pipe(
        map(content => {
          const matchingHashes = new Set(content.hits.map(hit => hit.objectID));
          return { type: "GOT_NEW_MATCHING_HASHES", matchingHashes };
        })
      );
    })
  );

export default combineEpics(searchEpic, urlChangedEpic);
