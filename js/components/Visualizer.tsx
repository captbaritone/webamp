import React from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import VisualizerInner from "./VisualizerInner";

type Props = {
  analyser: AnalyserNode;
};

function Visualizer(props: Props) {
  const colors = useTypedSelector(Selectors.getSkinColors);
  const style = useTypedSelector(Selectors.getVisualizerStyle);
  const status = useTypedSelector(Selectors.getMediaStatus);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);
  const dummyVizData = useTypedSelector(Selectors.getDummyVizData);

  const toggleVisualizerStyle = useActionCreator(Actions.toggleVisualizerStyle);

  const windowShade = getWindowShade("main");
  const innerProps = {
    colors,
    style,
    width: windowShade ? 38 : 76,
    height: windowShade ? 5 : 16,
    status,
    windowShade,
    dummyVizData,
    toggleVisualizerStyle,
  };
  return <VisualizerInner {...innerProps} {...props} />;
}

export default Visualizer;
