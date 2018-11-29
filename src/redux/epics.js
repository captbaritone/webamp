import { combineEpics } from "redux-observable";
import { of, from } from "rxjs";
import { filter, switchMap, map } from "rxjs/operators";
import { search } from "../algolia";

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

export default combineEpics(searchEpic);
