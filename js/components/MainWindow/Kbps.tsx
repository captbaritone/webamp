import React from "react";

import CharacterString from "../CharacterString";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

const Kbps = React.memo(() => {
  const kbps = useTypedSelector(Selectors.getKbps);
  return (
    <div id="kbps">
      <CharacterString>{kbps || ""}</CharacterString>
    </div>
  );
});

export default Kbps;
