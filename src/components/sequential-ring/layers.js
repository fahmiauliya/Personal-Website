// Keep the deck order throughout the entrance. Once floating, move cards to
// their depth order only while their painted bounds are clear of each other.
// An integer z-index cannot interpolate: swapping overlapping cards flashes.
export function sequentialLayers(cards, previousOrder, width, radii, cardSize) {
  const stack = cards.map((_, index) => index);
  if (cards.some(card => card.unfold < 1)) return stack;
  const order = previousOrder.length === cards.length ? [...previousOrder] : stack;
  const cardWidth = width * cardSize / 100;
  function separated(a, b) {
    const halfWidth = cardWidth * (a.scale + b.scale) / 2;
    return Math.abs(a.x - b.x) * radii.x > halfWidth + 2 ||
      Math.abs(a.y - b.y) * radii.y > halfWidth / .85 + 2;
  }
  // Adjacent swaps preserve every overlapping pair's existing occlusion order.
  for (let pass = 0; pass < cards.length; pass++) {
    let changed = false;
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i], b = order[i + 1];
      const depthDifference = cards[a].depth - cards[b].depth;
      if ((depthDifference > .001 || (Math.abs(depthDifference) <= .001 && a > b)) && separated(cards[a], cards[b])) {
        [order[i], order[i + 1]] = [b, a];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return order;
}
