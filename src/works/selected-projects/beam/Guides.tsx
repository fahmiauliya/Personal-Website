import './guides.css';

// A coded tile's construction lines, drawn in its own layer at Figma's positions (design px):
// 0.34px, 15% black on a light frame or 30% white on a dark one, running past the frame's
// edges (the tile clips them). Being inside the tile, they stack with its content in
// Figma's layer order.
export default function Guides({ x, y, dark = false }: { x: number[]; y: number[]; dark?: boolean }) {
  const tone = dark ? ' beam-guides__line--dark' : '';
  return (
    <>
      {y.map(top => <span key={`y-${top}`} className={`beam-guides__line beam-guides__line--horizontal${tone}`} style={{ top }} />)}
      {x.map(left => <span key={`x-${left}`} className={`beam-guides__line beam-guides__line--vertical${tone}`} style={{ left }} />)}
    </>
  );
}
