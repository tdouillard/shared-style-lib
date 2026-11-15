import { useRef, type RefObject } from "react";
import { useHScroll } from "./useHScroll.ts";

/** Horizontal scroll slider for the row of items held by `scroller` (give that row `overflow-x: auto`). */
export function HScrollBar({ scroller }: { scroller: RefObject<HTMLElement | null> }) {
  const track = useRef<HTMLDivElement>(null);
  const { thumb, trackProps } = useHScroll(scroller, track);
  return (
    <div ref={track} className={`g-hscroll ${thumb.off ? "is-off" : ""}`} {...trackProps}>
      <div className="g-hscroll__thumb" style={{ left: thumb.left, width: thumb.width }} />
    </div>
  );
}
