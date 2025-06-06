import React from "react";

function About() {
  return (
    <div className="static-content">
      <h1>About</h1>
      <p>
        The Winamp Skin Museum is an attempt to build a <i>fast</i>,{" "}
        <i>searchable</i>, and <i>shareable</i>, interface for the collection of
        Winamp Skins amassed on the{" "}
        <a
          href="https://archive.org/details/winampskins"
          target="_blank"
          rel="noopener noreferrer"
        >
          Internet Archive
        </a>
        .
      </p>
      <h2>Features:</h2>
      <ul>
        <li>
          <strong>Infinite scroll</strong> preview images
        </li>
        <li>
          <strong>Experience</strong> skins with integrated{" "}
          <a
            href="https://webamp.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Webamp
          </a>
        </li>
        <li>
          <strong>Fast search</strong> of indexed readme.txt texts
        </li>
      </ul>
      <p>
        Made by <a href="https://jordaneldredge.com">Jordan Eldredge</a>
      </p>
      <hr />
      <p>
        Want Winamp on your Windows PC, but with supported updates & new
        features?{" "}
        <a
          href="https://getwacup.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try WACUP
        </a>
      </p>
    </div>
  );
}

export default About;
