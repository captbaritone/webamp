import * as Utils from "./utils";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { delay } from "rxjs/operators";
import { Subject, combineLatest, timer } from "rxjs";

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(Utils.getWindowSize());
  useEffect(() => {
    // TODO: Consider thottle
    const handleResize = () => {
      setWindowSize(Utils.getWindowSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

// https://stackoverflow.com/a/13382873/1263117
export function useScrollbarWidth() {
  // TODO: Can this change over the lifetime of the window?
  return useMemo(() => {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }, []);
}

export function useActionCreator(actionCreator) {
  const dispatch = useDispatch();
  return useCallback(
    (...args) => dispatch(actionCreator(...args)),
    [dispatch, actionCreator]
  );
}

export function useWebampAnimation({ initialPosition }) {
  const [loaded, setLoaded] = useState(false);
  const [centered, setCentered] = useState(initialPosition == null);
  const [webampLoadedEvents] = useState(() => new Subject());
  const [transitionBeginEvents] = useState(() => new Subject());

  // Emit after both Webamp has loaded, and the transition is complete
  const startWebampFadein = useMemo(() => {
    const transitionComplete = transitionBeginEvents.pipe(delay(500));
    return combineLatest([webampLoadedEvents, transitionComplete]);
  }, [transitionBeginEvents, webampLoadedEvents]);

  // setLoaded(true) 400ms after startWebampFadein
  useEffect(() => {
    const webampFadeinComplete = startWebampFadein.pipe(delay(400));
    const subscription = webampFadeinComplete.subscribe(() => setLoaded(true));
    return () => subscription.unsubscribe();
  }, [setLoaded, startWebampFadein]);

  useEffect(() => {
    const subscription = startWebampFadein.subscribe(() => {
      document.body.classList.add("webamp-loaded");
    });
    return () => {
      document.body.classList.remove("webamp-loaded");
      subscription.unsubscribe();
    };
  }, [startWebampFadein]);

  // TODO: This might fire too frequently
  useEffect(() => {
    if (initialPosition != null) {
      const subscription = timer(0).subscribe(() => {
        // TODO: Observe DOM and recenter
        setCentered(true);
        transitionBeginEvents.next(null);
      });
      return () => subscription.unsubscribe();
    } else {
      transitionBeginEvents.next(null);
    }
  }, [initialPosition, setCentered, transitionBeginEvents]);

  return {
    centered,
    loaded,
    handleWebampLoaded: () => webampLoadedEvents.next(null),
  };
}

export function useQuery(query, variables) {
  const [data, setData] = useState(null);
  const [, setLoading] = useState(true);
  useEffect(() => {
    let unmounted = false;
    Utils.fetchGraphql(query, variables).then((data) => {
      if (!unmounted) {
        setData(data);
        setLoading(false);
      }
    });
    return () => {
      unmounted = true;
    };
  }, [query, variables]);
  return data;
}
