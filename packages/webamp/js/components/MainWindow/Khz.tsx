import { memo } from "react";

import CharacterString from "../CharacterString";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

const Khz = memo(() => {
  const khz = useTypedSelector(Selectors.getKhz);
  return (
    <div id="khz">
      <CharacterString>{khz || ""}</CharacterString>
    </div>
  );
});

export default Khz;
