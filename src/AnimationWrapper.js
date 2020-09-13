import React from "react";

import { delay } from "rxjs/operators";
import { Subject, combineLatest, timer } from "rxjs";
import Disposable from "./Disposable";

export default class AnimationWrapper extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    // TODO: Handle the case were we come from a permalink
    this._webampLoadedEvents = new Subject();
    this._transitionBeginEvents = new Subject();
    const transitionComplete = this._transitionBeginEvents.pipe(delay(500));

    // Emit after both Webamp has loaded, and the transition is complete
    const startWebampFadein = combineLatest([
      this._webampLoadedEvents,
      transitionComplete,
    ]);

    // This value matches the opacity transition timing for `#webamp` in CSS
    const webampFadeinComplete = startWebampFadein.pipe(delay(400));

    // Once webamp has loaded and the transition is complete, we can start the Webamp fadein
    // Once the webamp fadein is complete (400ms) we are "loaded"

    this._disposable.add(
      startWebampFadein.subscribe(() => {
        document.body.classList.add("webamp-loaded");
      }),
      webampFadeinComplete.subscribe(() => {
        this.props.setLoaded(true);
      }),
      () => {
        document.body.classList.remove("webamp-loaded");
      }
    );
  }

  componentDidMount() {
    if (this.props.initialPosition != null) {
      this._disposable.add(
        timer(0).subscribe(() => {
          // TODO: Observe DOM and recenter
          this.props.setCentered(true);
          this._transitionBeginEvents.next(null);
        })
      );
    } else {
      this._transitionBeginEvents.next(null);
    }
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }

  render() {
    return this.props.children({
      handleWebampLoaded: () => this._webampLoadedEvents.next(null),
    });
  }
}
