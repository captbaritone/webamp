import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { Hr, Node, Parent } from "./ContextMenu";
import { useActionCreator, useTypedSelector } from "../hooks";

const SkinContextMenu = () => {
  const loadDefaultSkin = useActionCreator(Actions.loadDefaultSkin);
  const openSkinFileDialog = useActionCreator(Actions.openSkinFileDialog);
  const setSkin = useActionCreator(Actions.setSkinFromUrl);

  const availableSkins = useTypedSelector(Selectors.getAvaliableSkins);
  return (
    <Parent label="Skins">
      <Node onClick={openSkinFileDialog} label="Load Skin..." />
      <Hr />
      <Node onClick={loadDefaultSkin} label={"<Base Skin>"} />
      {availableSkins.map((skin) => (
        <Node
          key={skin.url}
          onClick={() => setSkin(skin.url)}
          label={skin.name}
        />
      ))}
    </Parent>
  );
};
export default SkinContextMenu;
