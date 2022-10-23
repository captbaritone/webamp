import React from "react";
import { Subject } from "rxjs";
import { switchMap, distinctUntilChanged, map } from "rxjs/operators";
import Disposable from "../Disposable";

// The `download` attribute on `<a>` tags is not respected on cross origin
// assets. However, it does work for Object URLs. So, we download the skin as
// soon as we show the link and swap out the href with the Object URL as soon as
// it's loaded. The skin should already be cahced, so it should not actually
// result in an extra network request.
//
// There may be a breif time where the download link will use the hash name instead
// of the real name, but it's probably too short to actually ever be hit by a real user.
export default class DownloadLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = { href: null };
    this._hrefs = new Subject();
    this._disposables = new Disposable();
  }

  componentDidMount() {
    this._disposables.add(
      this._hrefs
        .pipe(
          distinctUntilChanged(),
          switchMap((href) => fetch(href)),
          switchMap((response) => response.blob()),
          map((blob) => URL.createObjectURL(blob))
        )
        .subscribe((url) => {
          this.setState({ href: url });
        })
    );
    this._hrefs.next(this.props.href);
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.href !== this.state.href) {
      URL.revokeObjectURL(prevState.href);
    }
    this._hrefs.next(this.props.href);
  }

  componentWillUnmount() {
    if (this.state.href) {
      URL.revokeObjectURL(this.state.href);
    }
    this._disposables.dispose();
  }

  render() {
    return (
      <a {...this.props} href={this.state.href || this.props.href}>
        {/* We have to explicitly set the children to make ESLint happy */}
        {this.props.children}
      </a>
    );
  }
}
