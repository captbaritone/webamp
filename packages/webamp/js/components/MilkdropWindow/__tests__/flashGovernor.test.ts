import { describe, test, expect } from "vitest";
import {
  createFlashGovernor,
  relativeLuminance,
  GovernorDecision,
} from "../flashGovernor";

describe("relativeLuminance", () => {
  test("computes correct CIE 1931 relative luminance", () => {
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 4);
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 4);
    // Green has highest photometric weight
    expect(relativeLuminance(0, 255, 0)).toBeCloseTo(0.7152, 2);
    expect(relativeLuminance(255, 0, 0)).toBeCloseTo(0.2126, 2);
    expect(relativeLuminance(0, 0, 255)).toBeCloseTo(0.0722, 2);
  });
});

describe("createFlashGovernor", () => {
  function createMockCanvas(getPixelLum: () => number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    // Mock 2D context for the 8x8 sampleCanvas created inside governor
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName: string) {
      const el = origCreateElement(tagName);
      if (tagName === "canvas") {
        (el as any).getContext = (type: string) => {
          if (type === "2d") {
            return {
              drawImage: () => {},
              getImageData: () => {
                const lum = getPixelLum();
                const byteVal = Math.round(lum * 255);
                const data = new Uint8ClampedArray(64 * 4);
                for (let i = 0; i < data.length; i += 4) {
                  data[i] = byteVal;
                  data[i + 1] = byteVal;
                  data[i + 2] = byteVal;
                  data[i + 3] = 255;
                }
                return { data };
              },
            } as any;
          }
          return null;
        };
      }
      return el;
    };

    return canvas;
  }

  test("maintains 1.0 scale during calm, non-flashing animation", () => {
    const governor = createFlashGovernor();
    let lum = 0.5;
    const canvas = createMockCanvas(() => lum);

    for (let frame = 0; frame < 60; frame++) {
      lum = 0.5 + Math.sin(frame * 0.05) * 0.02; // very gentle subtle change
      const decision = governor.tick(canvas, frame * 16.6);
      expect(decision.isDamping).toBe(false);
      expect(decision.scale).toBeCloseTo(1.0, 1);
    }
  });

  test("clamps brightness when encountering rapid flashing (> 3 transitions/sec)", () => {
    const governor = createFlashGovernor();
    let lum = 0.0;
    const canvas = createMockCanvas(() => lum);

    // Strobe between black (0.0) and white (1.0) every 33ms (~15Hz strobe)
    let lastDecision: GovernorDecision = governor.getDecision();
    for (let frame = 0; frame < 30; frame++) {
      lum = frame % 2 === 0 ? 0.0 : 1.0;
      lastDecision = governor.tick(canvas, frame * 33.3);
    }

    expect(lastDecision.transitionCount).toBeGreaterThan(3);
    expect(lastDecision.isDamping).toBe(true);
    expect(lastDecision.scale).toBeLessThan(0.7);
  });

  test("recovers brightness smoothly when strobing stops", () => {
    const governor = createFlashGovernor();
    let lum = 0.0;
    const canvas = createMockCanvas(() => lum);

    // Strobe first to trigger damping
    for (let frame = 0; frame < 20; frame++) {
      lum = frame % 2 === 0 ? 0.0 : 1.0;
      governor.tick(canvas, frame * 33.3);
    }

    expect(governor.getDecision().isDamping).toBe(true);

    // Now calm down for 2 seconds (constant calm frame)
    lum = 0.5;
    let recoveredDecision: GovernorDecision = governor.getDecision();
    for (let frame = 21; frame < 150; frame++) {
      recoveredDecision = governor.tick(canvas, frame * 33.3);
    }

    expect(recoveredDecision.transitionCount).toBe(0);
    expect(recoveredDecision.isDamping).toBe(false);
    expect(recoveredDecision.scale).toBeGreaterThan(0.95);
  });

  test("reset() immediately clears transitions and restores scale", () => {
    const governor = createFlashGovernor();
    let lum = 0.0;
    const canvas = createMockCanvas(() => lum);

    for (let frame = 0; frame < 20; frame++) {
      lum = frame % 2 === 0 ? 0.0 : 1.0;
      governor.tick(canvas, frame * 33.3);
    }
    expect(governor.getDecision().isDamping).toBe(true);

    governor.reset();
    expect(governor.getDecision().isDamping).toBe(false);
    expect(governor.getDecision().scale).toBe(1.0);
    expect(governor.getDecision().transitionCount).toBe(0);
  });
});
