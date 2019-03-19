// Single line text display that can animate and hold multiple registers
// Knows how to display various modes like tracking, volume, balance, etc.
import React from "react";
import { connect } from "react-redux";

import { STEP_MARQUEE } from "../../actionTypes";
import CharacterString from "../CharacterString";
import { AppState, Dispatch } from "../../types";
import * as Selectors from "../../selectors";

const SEPARATOR = "  ***  ";

interface StateProps {
  marqueeStep: number;
  text: string;
  doubled: boolean;
}
interface DispatchProps {
  stepMarquee(): void;
}

type Props = StateProps & DispatchProps;

interface State {
  stepping: boolean;
  dragOffset: number;
}

const CHAR_WIDTH = 5;
const MARQUEE_MAX_LENGTH = 31;

// Always positive modulus
export const mod = (n: number, m: number): number => ((n % m) + m) % m;

const isLong = (text: string): boolean => text.length >= MARQUEE_MAX_LENGTH;

// Given text and step, how many pixels should it be shifted?
export const stepOffset = (
  text: string,
  step: number,
  pixels: number
): number => {
  if (!isLong(text)) {
    return 0;
  }

  const stepOffsetWidth = step * CHAR_WIDTH; // Steps move one char at a time
  const offset = stepOffsetWidth + pixels;
  const stringLength = (text.length + SEPARATOR.length) * CHAR_WIDTH;

  return mod(offset, stringLength);
};

// Format an int as pixels
export const pixelUnits = (pixels: number): string => `${pixels}px`;

// If text is wider than the marquee, it needs to loop
export const loopText = (text: string): string =>
  isLong(text)
    ? `${text}${SEPARATOR}${text}`
    : text.padEnd(MARQUEE_MAX_LENGTH, " ");

class Marquee extends React.Component<Props, State> {
  stepHandle: NodeJS.Timer | null;
  constructor(props: Props) {
    super(props);
    this.state = { stepping: true, dragOffset: 0 };
    this.stepHandle = null;
  }

  componentDidMount() {
    this.stepHandle = setInterval(() => {
      if (this.state.stepping) {
        this.props.stepMarquee();
      }
    }, 220);
  }

  componentWillUnmount() {
    if (this.stepHandle) {
      clearTimeout(this.stepHandle);
    }
  }

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    const xStart = e.clientX;
    this.setState({ stepping: false });
    const handleMouseMove = (ee: MouseEvent) => {
      const diff = ee.clientX - xStart;
      this.setState({ dragOffset: -diff });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      // TODO: Remove this listener
      setTimeout(() => {
        this.setState({ stepping: true });
      }, 1000);
      document.removeEventListener("mouseUp", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  render() {
    const { text, marqueeStep, doubled } = this.props;
    const offset = stepOffset(text, marqueeStep, this.state.dragOffset);
    const offsetPixels = pixelUnits(-offset);
    const style: React.CSSProperties = {
      whiteSpace: "nowrap",
      willChange: "transform",
      transform: `translateX(${offsetPixels})`,
    };
    return (
      <div
        id="marquee"
        className="text"
        onMouseDown={this.handleMouseDown}
        title="Song Title"
      >
        <div
          style={style}
          // Force the DOM node to be recreated when the doubled size changes.
          // This works around a Chrome browser bug where the `will-change: transform;`
          // on this node seems to cause a change to the `image-rendering:
          // pixelated;` which we inherit from `#webamp` not to be respected.
          key={doubled ? "doubled" : "not-doubled"}
        >
          <CharacterString>{loopText(text)}</CharacterString>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  marqueeStep: state.display.marqueeStep,
  text: Selectors.getMarqueeText(state),
  doubled: Selectors.getDoubled(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    stepMarquee: () => dispatch({ type: STEP_MARQUEE }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Marquee);
