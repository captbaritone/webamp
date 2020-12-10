import { parseAni } from "./parser";

type AniCursorImage = {
  frames: {
    url: string;
    percents: number[];
  }[];
  duration: number;
};

const JIFFIES_PER_MS = 1000 / 60;

// Generate CSS for an animated cursor.
//
// This function returns CSS containing a set of keyframes with embedded Data
// URIs as well as a CSS rule to the given selector.
export function convertAniBinaryToCSS(
  selector: string,
  aniBinary: Uint8Array
): string {
  const ani = readAni(aniBinary);

  const animationName = `ani-cursor-${uniqueId()}`;

  const keyframes = ani.frames.map(({ url, percents }) => {
    const percent = percents.map((num) => `${num}%`).join(", ");
    return `${percent} { cursor: url(${url}), auto; }`;
  });

  // CSS properties with a animation type of "discrete", like `cursor`, actually
  // switch half-way _between_ each keyframe percentage. Luckily this half-way
  // measurement is applied _after_ the easing function is applied. So, we can
  // force the frames to appear at exactly the % that we specify by using
  // `timing-function` of `step-end`.
  //
  // https://drafts.csswg.org/web-animations-1/#discrete
  const timingFunction = "step-end";

  // Winamp (re)starts the animation cycle when your mouse enters an element. By
  // default this approach would cause the animation to run continuously, even
  // when the cursor is not visible. To match Winamp's behavior we add a
  // `:hover` pseudo selector so that the animation only runs when the cursor is
  // visible.
  const pseudoSelector = ":hover";

  // prettier-ignore
  return `
    @keyframes ${animationName} {
        ${keyframes.join("\n")}
    }
    ${selector}${pseudoSelector} {
        animation: ${animationName} ${ani.duration}ms ${timingFunction} infinite;
    }
   `;
}

function readAni(contents: Uint8Array): AniCursorImage {
  const ani = parseAni(contents);
  const rate = ani.rate ?? ani.images.map(() => ani.metadata.iDispRate);
  const duration = sum(rate);

  const frames = ani.images.map((image) => ({
    url: curUrlFromByteArray(image),
    percents: [] as number[],
  }));

  let elapsed = 0;
  rate.forEach((r, i) => {
    const frameIdx = ani.seq ? ani.seq[i] : i;
    frames[frameIdx].percents.push((elapsed / duration) * 100);
    elapsed += r;
  });

  return { duration: duration * JIFFIES_PER_MS, frames };
}

/* Utility Functions */

let i = 0;
const uniqueId = () => i++;

function base64FromDataArray(dataArray: Uint8Array): string {
  return window.btoa(String.fromCharCode(...dataArray));
}

function curUrlFromByteArray(arr: Uint8Array) {
  const base64 = base64FromDataArray(arr);
  return `data:image/x-win-bitmap;base64,${base64}`;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
