import { render } from "react-dom";

interface Props {
  averageTrackLength: string;
  numberOfTracks: number;
  playlistLengthSeconds: number;
  playlistLengthMinutes: number;
  tracks: string[];
}

export const getAsDataURI = (text: string): string =>
  `data:text/html;base64,${window.btoa(text)}`;

// Replaces deprecated "noshade" attribute
const noshadeStyle = {
  height: "2px",
  borderWidth: 0,
  color: "gray",
  backgroundColor: "gray",
};

// We use all kinds of non-standard attributes and tags. So we create these fake
// components to trick Typescript.
const Body = (props: any) => {
  // @ts-ignore
  return <body {...props} />;
};

const Font = (props: any) => {
  // @ts-ignore
  return <font {...props} />;
};

const Hr = (props: any) => {
  // @ts-ignore
  return <hr {...props} />;
};

const Div = (props: any) => {
  // @ts-ignore
  return <div {...props} />;
};

const Table = (props: any) => {
  // @ts-ignore
  return <table {...props} />;
};

// TODO: Move <html> tag out to the string creation step in order
// to avoid the warning.
const Playlist = (props: Props) => (
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
    <Body bgcolor="#000080" topmargin="0" leftmargin="0" text="#FFFFFF">
      <Div align="center">
        <Div className="para2" align="center">
          <p>WINAMP</p>
        </Div>
        <Div className="para1" align="center">
          <p>playlist</p>
        </Div>
      </Div>
      <Hr
        align="left"
        width="90%"
        size="1"
        color="#FFBF00"
        style={noshadeStyle}
      />
      <Div align="right">
        <Table border="0" cellSpacing="0" cellPadding="0" width="98%">
          {/* Added <tbody> tag */}
          <tbody>
            <tr>
              <td>
                <small>
                  <small>
                    <Font face="Arial" color="#FFBF00">
                      {props.numberOfTracks}
                    </Font>
                    <Font color="#409FFF" face="Arial">
                      {" track in playlist, average track length: "}
                    </Font>
                    <Font face="Arial" color="#FFBF00">
                      {props.averageTrackLength}
                    </Font>
                  </small>
                </small>
                <br />
                <small>
                  <small>
                    <Font color="#409FFF" face="Arial">
                      {"Playlist length: "}
                    </Font>
                    <Font face="Arial" color="#FFBF00">
                      {props.playlistLengthMinutes}
                    </Font>
                    <Font color="#409FFF" face="Arial">
                      {" minutes "}
                    </Font>
                    <Font face="Arial" color="#FFBF00">
                      {props.playlistLengthSeconds}
                    </Font>
                    <Font color="#409FFF" face="Arial">
                      {" second "}
                    </Font>
                    <br />
                    <Font color="#409FFF" face="Arial">
                      Right-click <a href="./">here</a> to save this HTML file.
                    </Font>
                  </small>
                </small>
              </td>
            </tr>
          </tbody>
        </Table>
      </Div>
      <blockquote>
        <p>
          <Font color="#FFBF00" face="Arial">
            <big>Playlist files:</big>
          </Font>
          {/* Added closing tag here */}
        </p>
        <ul>
          <Font face="Arial" color="#FFFFFF">
            <small>
              {props.tracks.map((track) => (
                <span key={track}>
                  {track}
                  <br />
                </span>
              ))}
              {/* Added closing tag here */}
            </small>
          </Font>
        </ul>
      </blockquote>
      <Hr
        align="left"
        width="90%"
        size="1"
        color="#FFBF00"
        style={noshadeStyle}
      />
    </Body>
  </html>
);

const createPlaylistHTML = (props: Props): string => {
  const node = document.createElement("div");
  render(<Playlist {...props} />, node);
  return node.innerHTML;
};

export const createPlaylistURL = (props: Props): string =>
  getAsDataURI(createPlaylistHTML(props));
