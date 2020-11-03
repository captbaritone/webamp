import { useMemo } from "react";
import Slider from "rc-slider";
import { Slider as SliderType } from "../../types";
import { useTypedSelector, useActionCreator } from "../../hooks";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";

interface Props {
  id: string;
  band: SliderType;
  onChange(value: number): void;
}

const MAX_VALUE = 100;
// Given a value between 1-100, return the sprite number (0-27)
export const spriteNumber = (value: number): number => {
  const percent = value / 100;
  return Math.round(percent * 27);
};

// Given a sprite number, return the x,y
export const spriteOffsets = (number: number): { x: number; y: number } => {
  const x = number % 14;
  const y = Math.floor(number / 14);
  return { x, y };
};

const Handle = () => <div className="rc-slider-handle" />;

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

  const handleMouseDown = () => focusBand(band);

  return (
    <div id={id} className="band" style={{ backgroundPosition }}>
      <Slider
        min={0}
        max={MAX_VALUE}
        step={1}
        value={MAX_VALUE - value}
        vertical
        onChange={onChange}
        onBeforeChange={handleMouseDown}
        onAfterChange={usetFocus}
        handle={Handle}
      />
    </div>
  );
}
