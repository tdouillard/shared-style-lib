/** Paint the filled part of a `.g-range` slider (the CSS reads the --v variable). Call it on input. */
export function setRangeFill(input: HTMLInputElement) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const pct = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--v", `${pct}%`);
}
