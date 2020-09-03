import React from "react";

function About() {
  return (
    <div className="static-content">
      <h1>About</h1>
      <p>
        The Winamp Skin Museum is an attempt to build a <i>fast</i>,{" "}
        <i>searchable</i>, and <i>shareable</i>, interface for the collection of
        Winamp Skins amassed on the{" "}
        <a href="https://archive.org/details/winampskins">Internet Archive</a>.
      </p>
      <h2>Features:</h2>
      <ul>
        <li>
          <strong>Infinite scroll</strong> preview images
        </li>
        <li>
          <strong>Experience</strong> skins with integrated{" "}
          <a href="https://webamp.org">Webamp</a>
        </li>
        <li>
          <strong>Fast search</strong> of indexed readme.txt texts
        </li>
      </ul>
      <p>
        Made by <a href="https://jordaneldredge.com">Jordan Eldredge</a> (
        <a href="https://twitter.com/captbaritone">@captbaritone</a>)
      </p>
      <p>
        You might enjoy my Twitter bot{" "}
        <a href="https://twitter.com/winampskins">@winampskins</a>
      </p>
    </div>
  );
}

export default About;
