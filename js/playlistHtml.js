import React from "react";
import { render } from "react-dom";

export const getAsDataURI = text =>
  `data:text/html;base64,${window.btoa(text)}`;

// Replaces deprecated "noshade" attribute
const noshadeStyle = {
  height: "2px",
  borderWidth: 0,
  color: "gray",
  backgroundColor: "gray"
};

// TODO: Move <html> tag out to the string creation step in order
// to avoid the warning.
const Playlist = props => (
  <html>
    <head>
      <link rel="stylesheet" href="null" />
      <style type="text/css">
        {`
        body { background: #000040; }
        .para1 { margin-top: -42px; margin-left: 145px; margin-right: 10px; font-family: "font2, Arial"; font-size: 30px; line-height: 35px; text-align: left; color: #E1E1E1; }
        .para2 { margin-top: 15px; margin-left: 15px; margin-right: 50px; font-family: "font1, Arial Black"; font-size: 50px; line-height: 40px; text-align: left; color: #004080; }
        `}
      </style>
      <title>Winamp Generated PlayList</title>
    </head>
    <body bgcolor="#000080" topmargin="0" leftmargin="0" text="#FFFFFF">
      <div align="center">
        <div className="para2" align="center">
          <p>WINAMP</p>
        </div>
        <div className="para1" align="center">
          <p>playlist</p>
        </div>
      </div>
      <hr
        align="left"
        width="90%"
        size="1"
        color="#FFBF00"
        style={noshadeStyle}
      />
      <div align="right">
        <table border="0" cellSpacing="0" cellPadding="0" width="98%">
          {/* Added <tbody> tag */}
          <tbody>
            <tr>
              <td>
                <small>
                  <small>
                    <font face="Arial" color="#FFBF00">
                      {props.numberOfTracks}
                    </font>
                    <font color="#409FFF" face="Arial">
                      {" track in playlist, average track length: "}
                    </font>
                    <font face="Arial" color="#FFBF00">
                      {props.averageTrackLength}
                    </font>
                  </small>
                </small>
                <br />
                <small>
                  <small>
                    <font color="#409FFF" face="Arial">
                      {"Playlist length: "}
                    </font>
                    <font face="Arial" color="#FFBF00">
                      {props.playlistLengthMinutes}
                    </font>
                    <font color="#409FFF" face="Arial">
                      {" minutes "}
                    </font>
                    <font face="Arial" color="#FFBF00">
                      {props.playlistLengthSeconds}
                    </font>
                    <font color="#409FFF" face="Arial">
                      {" second "}
                    </font>
                    <br />
                    <font color="#409FFF" face="Arial">
                      Right-click <a href="./">here</a> to save this HTML file.
                    </font>
                  </small>
                </small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <blockquote>
        <p>
          <font color="#FFBF00" face="Arial">
            <big>Playlist files:</big>
          </font>
          {/* Added closing tag here */}
        </p>
        <ul>
          <font face="Arial" color="#FFFFFF">
            <small>
              {props.tracks.map(track => (
                <span key={track}>
                  {track}
                  <br />
                </span>
              ))}
              {/* Added closing tag here */}
            </small>
          </font>
        </ul>
      </blockquote>
      <hr
        align="left"
        width="90%"
        size="1"
        color="#FFBF00"
        style={noshadeStyle}
      />
    </body>
  </html>
);

const createPlaylistHTML = props => {
  const node = document.createElement("div");
  render(<Playlist {...props} />, node);
  return node.innerHTML;
};

export const createPlaylistURL = props =>
  getAsDataURI(createPlaylistHTML(props));
