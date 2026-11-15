import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

export interface RailMetrics {
  /** thumb top (px) and height (px) inside the track */
  top: number;
  size: number;
  /** more content below the visible part */
  more: boolean;
  /** the content is taller than the box */
  scrollable: boolean;
}

/**
 * Logic of the on-screen scroll rail (up / thumb / down) for touch panels that cannot drag-scroll.
 * Pure behaviour, no markup: <ScrollList> renders it.
 */
export function useScrollRail(body: RefObject<HTMLDivElement | null>, track: RefObject<HTMLDivElement | null>) {
  const [m, setM] = useState<RailMetrics>({ top: 0, size: 100, more: false, scrollable: false });
  const repeat = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const sync = () => {
    const s = body.current;
    const t = track.current;
    if (!s || !t) return;
    const max = s.scrollHeight - s.clientHeight;
    const th = Math.max(28, t.clientHeight * Math.min(1, s.clientHeight / Math.max(1, s.scrollHeight)));
    setM({
      size: th,
      top: max > 0 ? (s.scrollTop / max) * (t.clientHeight - th) : 0,
      more: max - s.scrollTop > 4,
      scrollable: max > 0,
    });
  };

  // follow size and content changes
  useEffect(() => {
    sync();
    const s = body.current;
    if (!s) return;
    const ro = new ResizeObserver(sync);
    ro.observe(s);
    const mo = new MutationObserver(sync);
    mo.observe(s, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const page = (dir: number) => body.current?.scrollBy({ top: dir * body.current.clientHeight * 0.8, behavior: "smooth" });
  const stopRepeat = () => clearInterval(repeat.current);

  /** Props for the up (-1) / down (1) buttons: tap = one page, hold = keep paging. */
  const holdProps = (dir: number) => ({
    onPointerDown: () => {
      page(dir);
      stopRepeat();
      repeat.current = setInterval(() => page(dir), 450);
    },
    onPointerUp: stopRepeat,
    onPointerLeave: stopRepeat,
    onPointerCancel: stopRepeat,
  });

  /** Props for the draggable thumb. */
  const thumbProps = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      const th = e.currentTarget;
      th.setPointerCapture(e.pointerId);
      th.onpointermove = (ev) => {
        const s = body.current;
        const t = track.current;
        if (!s || !t) return;
        const r = t.getBoundingClientRect();
        const f = Math.min(1, Math.max(0, (ev.clientY - r.top - th.clientHeight / 2) / Math.max(1, t.clientHeight - th.clientHeight)));
        s.scrollTop = f * (s.scrollHeight - s.clientHeight);
      };
      th.onpointerup = () => {
        th.onpointermove = null;
      };
    },
  };

  return { metrics: m, sync, holdProps, thumbProps };
}
