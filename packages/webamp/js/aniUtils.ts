import { parseAni } from "./aniParser";
import { AniCursorImage } from "./types";
import * as Utils from "./utils";
import * as FileUtils from "./fileUtils";

const JIFFIES_PER_MS = 1000 / 60;

export function readAni(contents: Uint8Array): AniCursorImage {
  const ani = parseAni(contents);
  const rate = ani.rate ?? ani.images.map(() => ani.metadata.iDispRate);
  const duration = Utils.sum(rate);

  const frames = ani.images.map((image) => ({
    url: FileUtils.curUrlFromByteArray(image),
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

// Generate CSS for an animated cursor.
//
// Based on https://css-tricks.com/forums/topic/animated-cursor/
//
// Browsers won't render animated cursor images specified via CSS. For `.ani`
// images, we already have the frames as indiviual images, so we create a CSS
// animation.
//
// This function returns CSS containing a set of keyframes with embedded Data
// URIs as well as a CSS rule to the given selector.
//
// **Note:** This does not seem to work on Safari. I've filed an issue here:
// https://bugs.webkit.org/show_bug.cgi?id=219564
export function aniCss(selector: string, ani: AniCursorImage): string {
  const animationName = `webamp-ani-cursor-${Utils.uniqueId()}`;

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

  return `
      @keyframes ${animationName} {
        ${keyframes.join("\n")}
      }
      ${selector}${pseudoSelector} {
        animation: ${animationName} ${
    ani.duration
  }ms ${timingFunction} infinite;
      }
    `;
}
