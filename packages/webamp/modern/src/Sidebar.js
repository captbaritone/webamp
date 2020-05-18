import React from "react";

export default function Sidebar({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      style={{
        height: "100%",
        width: open ? "50%" : 0,
        borderLeft: open ? "2px solid grey" : "20px solid grey",
        padding: 0,
        position: "fixed",
        right: 0,
        transition: "0.25s ease-out",
      }}
      onClick={() => setOpen(true)}
    >
      {open && children}
    </div>
  );
}
