import React, { useState } from "react";

interface Props {
  headings: Array<string>;
  rows: Array<Array<any>>;
  widths: Array<number>;
}

export default function LibraryTable(props: Props) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: props.widths.map(width => `${width}px`).join(" "),
  };

  return (
    <div
      className="webamp-media-library-item"
      style={{ height: "100%", position: "relative" }}
    >
      <div
        className="webamp-media-library-table"
        style={{
          overflow: "scroll",
          height: "100%",
        }}
      >
        <div style={rowStyle} className="library-table-heading">
          {props.headings.map((heading, i) => (
            <div key={`heading-${i}-${heading}`}>{heading}</div>
          ))}
        </div>
        {props.rows.map((row, i) => (
          <div
            style={{
              ...rowStyle,
              boxSizing: "border-box",
              border: i === selectedRow ? "1px solid red" : "none",
            }}
            onClick={() => setSelectedRow(i)}
            key={`row-${i}`}
          >
            {row.map((text, j) => (
              <div style={{ overflow: "hidden" }} key={`cell-${j}`}>
                {text}
              </div>
            ))}
          </div>
        ))}
        <div
          style={{
            zIndex: 99999,
            color: "white",
            width: 1,
            position: "absolute",
            left: 50,
            top: 0,
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
