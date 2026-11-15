import { useRef, type ReactNode } from "react";
import { useScrollRail } from "./useScrollRail.ts";

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

/**
 * Scrollable area with an on-screen rail (▲ / draggable thumb / ▼), for touch screens that cannot drag-scroll.
 * It fills its parent when the parent is a flex column, or give it a `height`.
 */
export function ScrollList({ children, height }: { children: ReactNode; height?: number | string }) {
  const body = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { metrics, sync, holdProps, thumbProps } = useScrollRail(body, track);

  return (
    <div className="g-scroll" style={height !== undefined ? { height } : undefined}>
      <div className="g-scroll__body" ref={body} onScroll={sync}>
        {children}
      </div>
      <div className={`g-scroll__fade ${metrics.more ? "is-on" : ""}`}>▼ more below</div>
      <div className={`g-scroll__rail ${metrics.scrollable ? "" : "is-off"}`}>
        <button className="g-scroll__btn g-scroll__btn--up" aria-label="Scroll up" {...holdProps(-1)}>
          <Chevron />
        </button>
        <div className="g-scroll__track" ref={track}>
          <div className="g-scroll__thumb" style={{ top: metrics.top, height: metrics.size }} {...thumbProps} />
        </div>
        <button className="g-scroll__btn" aria-label="Scroll down" {...holdProps(1)}>
          <Chevron />
        </button>
      </div>
    </div>
  );
}
