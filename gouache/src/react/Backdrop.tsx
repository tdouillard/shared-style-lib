import { useLayoutEffect, useRef } from "react";
import { paintBackdrop, type BackdropOptions } from "../backdrop.ts";
import { useTheme } from "./useTheme.ts";

/**
 * The painted backdrop. Put it as the first child of a `.g-page` (it sits behind everything) and it repaints
 * when the theme changes. `fixed` pins it to the viewport (for scrolling pages) instead of its container.
 */
export function Backdrop({ fixed = false, rough = true, seed }: { fixed?: boolean } & Pick<BackdropOptions, "rough" | "seed">) {
  const ref = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  useLayoutEffect(() => {
    if (ref.current) paintBackdrop(ref.current, { theme, rough, seed });
  }, [theme, rough, seed]);
  return (
    <div className={`g-backdrop ${fixed ? "g-backdrop--fixed" : ""}`} aria-hidden>
      <svg ref={ref} />
    </div>
  );
}
