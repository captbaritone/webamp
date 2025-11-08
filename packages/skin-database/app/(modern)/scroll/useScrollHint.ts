import { useEffect } from "react";

type UseScrollHintOptions = {
  containerRef: HTMLDivElement | null;
  enabled: boolean;
  delayMs?: number;
  scrollAmount?: number;
  animationDuration?: number;
  onHintShown?: () => void;
};

/**
 * A hook that provides a gentle scroll hint animation to encourage user interaction.
 * After a delay, if the user hasn't scrolled, it will scroll down slightly and bounce back.
 */
export function useScrollHint({
  containerRef,
  enabled,
  delayMs = 5000,
  scrollAmount = 80,
  animationDuration = 1000,
  onHintShown,
}: UseScrollHintOptions) {
  useEffect(() => {
    if (containerRef == null || !enabled) {
      return;
    }

    const hintTimer = setTimeout(() => {
      if (!enabled || containerRef.scrollTop !== 0) {
        return;
      }

      const startScrollTop = containerRef.scrollTop;
      const startTime = Date.now();

      // Temporarily disable scroll snap for smooth animation
      const originalScrollSnapType = containerRef.style.scrollSnapType;
      containerRef.style.scrollSnapType = "none";

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Bouncy easing function - overshoots and bounces back
        const easeOutBounce = (t: number) => {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (t < 1 / d1) {
            return n1 * t * t;
          } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
          } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
          } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
          }
        };

        // Create a bounce effect: scroll down quickly, then bounce back
        let offset;
        if (progress < 0.4) {
          // First 40%: scroll down quickly
          const t = progress / 0.4;
          offset = scrollAmount * t * t; // Quadratic ease-in
        } else {
          // Last 60%: bounce back with overshoot
          const t = (progress - 0.4) / 0.6;
          offset = scrollAmount * (1 - easeOutBounce(t));
        }

        containerRef.scrollTop = startScrollTop + offset;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure we end exactly where we started
          containerRef.scrollTop = startScrollTop;
          // Re-enable scroll snap
          containerRef.style.scrollSnapType = originalScrollSnapType;
        }
      };

      animate();
      onHintShown?.();
    }, delayMs);

    return () => {
      clearTimeout(hintTimer);
    };
  }, [
    containerRef,
    enabled,
    delayMs,
    scrollAmount,
    animationDuration,
    onHintShown,
  ]);
}
