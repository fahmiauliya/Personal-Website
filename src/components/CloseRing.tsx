// Thin circle drawn around the project close X on hover (styles: .close-ring in
// global.css). It is a stroke whose dash offset animates, so the line travels around
// the circumference from the top instead of fading in; leaving reverses it.
export default function CloseRing() {
  return (
    <svg className="close-ring" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <circle cx="14" cy="14" r="13.25" pathLength="1" />
    </svg>
  );
}
