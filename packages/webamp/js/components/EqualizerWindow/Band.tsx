import { useMemo } from "react";
import { Slider as SliderType } from "../../types";
import { useTypedSelector, useActionCreator } from "../../hooks";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import VerticalSlider from "../VerticalSlider";

interface Props {
  id: string;
  band: SliderType;
  onChange(value: number): void;
}

const MAX_VALUE = 100;

// Given a value between 1-100, return the sprite number (0-27)
export const spriteNumber = (value: number): number => {
  const percent = value / MAX_VALUE;
  return Math.round(percent * 27);
};

// Given a sprite number, return the x,y
export const spriteOffsets = (number: number): { x: number; y: number } => {
  const x = number % 14;
  const y = Math.floor(number / 14);
  return { x, y };
};

const Handle = () => {
  const style = { width: 11, height: 11, marginLeft: 1 };
  return <div style={style} className="slider-handle" />;
};

export default function Band({ id, onChange, band }: Props) {
  const sliders = useTypedSelector(Selectors.getSliders);
  const value = sliders[band];
  const backgroundPosition = useMemo(() => {
    const { x, y } = spriteOffsets(spriteNumber(value));
    const xOffset = x * 15; // Each sprite is 15px wide
    const yOffset = y * 65; // Each sprite is 15px tall
    return `-${xOffset}px -${yOffset}px`;
  }, [value]);
  const focusBand = useActionCreator(Actions.focusBand);
  const usetFocus = useActionCreator(Actions.unsetFocus);

  // Note: The band background is actually one pixel taller (63) than the slider
  // it contains (62).
  return (
    <div id={id} className="band" style={{ backgroundPosition, height: 63 }}>
      <VerticalSlider
        height={62}
        width={14}
        handleHeight={11}
        value={1 - value / MAX_VALUE}
        onBeforeChange={() => focusBand(band)}
        onChange={(val) => onChange((1 - val) * MAX_VALUE)}
        onAfterChange={usetFocus}
        handle={<Handle />}
      />
    </div>
  );
}
