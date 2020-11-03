import { memo } from "react";

import CharacterString from "../CharacterString";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

const Kbps = memo(() => {
  const kbps = useTypedSelector(Selectors.getKbps);
  return (
    <div id="kbps">
      <CharacterString>{kbps || ""}</CharacterString>
    </div>
  );
});

export default Kbps;
