import { useCallback, useEffect, useRef } from "react";

// Looping alarm built with WebAudio so no audio file is needed.
export function useRing(active: boolean, unlocked: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);

  const unlock = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    void ctxRef.current.resume();
  }, []);

  useEffect(() => {
    const stop = () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
    };
    if (!active || !unlocked || !ctxRef.current) return stop;
    const ctx = ctxRef.current;
    const beep = () => {
      [0, 0.25].forEach((offset) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.value = offset ? 660 : 880;
        g.gain.value = 0.25;
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + offset);
        o.stop(ctx.currentTime + offset + 0.2);
      });
    };
    beep();
    timer.current = window.setInterval(beep, 1200);
    return stop;
  }, [active, unlocked]);

  return unlock;
}
