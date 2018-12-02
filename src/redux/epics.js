import { combineEpics } from "redux-observable";
import { of, from, empty } from "rxjs";
import * as Actions from "./actionCreators";
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
        return of(Actions.selectedSkin(segments[2]));
      }
      if (query == null) {
        return empty();
      }
      return of(Actions.searchQueryChanged(query));
    })
  );

const searchEpic = actions =>
  actions.pipe(
    filter(action => action.type === "SEARCH_QUERY_CHANGED"),
    switchMap(({ query }) => {
      if (query == null || query.length === 0) {
        return of(Actions.gotNewMatchingHashes(null));
      }

      return from(search(query)).pipe(
        map(content => {
          const matchingHashes = new Set(content.hits.map(hit => hit.objectID));
          return Actions.gotNewMatchingHashes(matchingHashes);
        })
      );
    })
  );

export default combineEpics(searchEpic, urlChangedEpic);
