import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Animates a number from its previous value to `target` (ease-out).
// Shows the final value immediately when the user prefers reduced motion.
export default function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);
  const shownRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      shownRef.current = target;
      setValue(target);
      return undefined;
    }

    const from = shownRef.current;
    const start = performance.now();
    let frame;

    function tick(now) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      shownRef.current = Math.round(from + (target - from) * eased);
      setValue(shownRef.current);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
