import React from "react";
import JSZip from "jszip";
import { switchMap } from "rxjs/operators";
import { from, empty } from "rxjs";
import Disposable from "./Disposable";

export default class Readme extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    this.state = { readmeText: null };
  }

  componentDidMount() {
    this._fetchReadme();
  }

  componentDidUpdate(_, oldState) {
    if (this.state.skinUrl != oldState.skinUrl) {
      this._fetchReadme();
    }
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }

  _fetchReadme() {
    this._disposable.add(
      from(fetch(this.props.skinUrl))
        .pipe(
          switchMap(response => response.blob()),
          switchMap(blob => JSZip.loadAsync(blob)),
          switchMap(zip => {
            const readme = zip.file("readme.txt");
            if (readme == null) {
              return empty();
            }
            return readme.async("string");
          })
        )
        .subscribe(text => {
          console.log(text);
          // this.setState({ readmeText: text });
        })
    );
  }

  render() {
    return (
      this.state.readmeText && (
        <pre
          style={{
            backgroundColor: "white",
            color: "black",
            position: "absolute",
            width: "500px",
            right: 0
          }}
        >
          {this.state.readmeText}
        </pre>
      )
    );
  }
}
