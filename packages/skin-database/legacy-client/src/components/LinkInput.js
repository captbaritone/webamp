import React from "react";

function LinkInput({ permalink, hide }) {
  return (
    <div>
      <input
        style={{
          padding: "5px",
          width: "300px",
          marginBottom: "10px",
        }}
        onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)}
        className="permalink-input"
        value={permalink}
        readOnly
        autoFocus
      />
      <span
        style={{
          fontSize: "18px",
          marginLeft: "5px",
          cursor: "pointer",
        }}
        onClick={hide}
      >
        &times;
      </span>
    </div>
  );
}

export default LinkInput;
