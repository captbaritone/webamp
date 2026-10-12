import ClickedDiv from "../ClickedDiv";
import { useTypedSelector, useActionCreator } from "../../hooks";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { WINDOWS } from "../../constants";
import WinampButton from "../WinampButton";

export default function EqTitleButtons() {
  const focusedWindow = useTypedSelector(Selectors.getFocusedWindow);

  const selected = focusedWindow === WINDOWS.EQUALIZER;
  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleEqualizerShadeMode = useActionCreator(
    Actions.toggleEqualizerShadeMode
  );
  return (
    <ClickedDiv id="eq-buttons" key={selected ? "selected" : "unselected"}>
      <WinampButton
        id="equalizer-shade"
        aria-label="Toggle Windowshade Mode"
        onClick={toggleEqualizerShadeMode}
      />
      <WinampButton
        id="equalizer-close"
        aria-label="Close"
        onClick={() => closeWindow(WINDOWS.EQUALIZER)}
      />
    </ClickedDiv>
  );
}
