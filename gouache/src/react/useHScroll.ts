import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/**
 * Logic of a horizontal scroll slider that drives a row of items (`scroller`): the thumb follows the scroll
 * position and dragging it scrolls the row. Behaviour only, <HScrollBar> renders it.
 */
export function useHScroll(scroller: RefObject<HTMLElement | null>, track: RefObject<HTMLDivElement | null>) {
  const [thumb, setThumb] = useState({ left: 0, width: 0, off: true });
  const dragging = useRef(false);

  const sync = () => {
    const m = scroller.current;
    const t = track.current;
    if (!m || !t) return;
    const max = m.scrollWidth - m.clientWidth;
    const tw = t.clientWidth;
    const width = max <= 0 ? tw : Math.max(44, (tw * m.clientWidth) / m.scrollWidth);
    setThumb({ width, left: max <= 0 ? 0 : (m.scrollLeft / max) * (tw - width), off: max <= 0 });
  };

  useEffect(() => {
    sync();
    const m = scroller.current;
    if (!m) return;
    const ro = new ResizeObserver(sync);
    ro.observe(m);
    m.addEventListener("scroll", sync);
    return () => {
      ro.disconnect();
      m.removeEventListener("scroll", sync);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollFromX = (x: number) => {
    const m = scroller.current;
    const t = track.current;
    if (!m || !t) return;
    const r = t.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (x - r.left - thumb.width / 2) / Math.max(1, r.width - thumb.width)));
    m.scrollLeft = f * (m.scrollWidth - m.clientWidth);
  };

  const trackProps = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      scrollFromX(e.clientX);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => dragging.current && scrollFromX(e.clientX),
    onPointerUp: () => (dragging.current = false),
    onPointerCancel: () => (dragging.current = false),
  };

  return { thumb, trackProps };
}
