# Bifrost Rive visuals → SVG

The Rive files Bifrost motions 05, 08, 09 and 13 played (Motion Lab's `public/rive/m5-visual-*.riv`,
`motion-9-*_visual.riv`; 13's `m13-visual-1.riv` is the same file as `m5-visual-3.riv`) and the Compai
card's hero animation, rebuilt as animated SVG (SMIL) so the site needs no Rive player.

1. In a scratch folder: `player.html`, `replay.html`, `rive.js` + `rive.wasm` (the site no longer
   depends on Rive: `npm i --no-save @rive-app/canvas@4.x` in a scratch copy, then take them from
   `node_modules/@rive-app/canvas`) and the `.riv` files (Motion Lab's `public/rive/`); serve it
   (`python3 -m http.server 8765 --bind 127.0.0.1`) and run ONE headless Chrome
   (`--headless=new --remote-debugging-port=9378`).
2. `node record2.mjs 1500 <file.riv>...` — plays each file as the site did (autoplay, then its first
   state machine) on a controlled 60fps clock and saves every frame's drawing (as changes) to
   `rec2-<name>.json`. One tab, closed at the end.
3. `python3 rive2smil.py <name> <out.svg>` — the SVG (see its header for how); add `timeline` for a
   recording made by `recordscrub.mjs` (one timeline scrubbed frame by frame, as Compai's card
   sets it).
4. Check: copy the recordings and SVGs next to `replay.html`, then
   `node verify2.mjs <name> 45 400 1111` and `python3 cmp2.py <name> 45 400 1111` — each recorded
   frame drawn exactly as recorded vs the SVG at the same moment.

Close Chrome when done.
