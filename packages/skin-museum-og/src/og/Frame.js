export default function Frame({ children }) {
  return (
    <div
      style={{
        background: "black",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        justifyContent: "space-between",
        background: "linear-gradient(45deg,#000,#191927 66%,#000)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          justifyItems: "center",
          width: "100%",
          flexGrow: 10,
          alignItems: "stretch",
        }}
      >
        {children}
      </div>
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(90deg,#111119,#282742 66%,#191927)",
          color: "white",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: "20px 30px",
          width: "100%",
        }}
      >
        <div>Winamp Skin Museum</div>
        <div>skins.webamp.org</div>
      </div>
    </div>
  );
}
