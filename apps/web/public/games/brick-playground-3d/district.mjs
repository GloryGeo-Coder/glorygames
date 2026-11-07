// District coordinates are shared by the editor, explorer, scenery and delivery checkpoints.
export const DISTRICT = { x: 24, z: 12 };
export const LOTS = [
  { name: 'Produce Depot', x: -16, color: '#287b75', ground: '#e5c68a', sign: 'PRODUCE' },
  { name: 'Market Hall', x: 0, color: '#d38535', ground: '#edce9e', sign: 'MARKET' },
  { name: 'Corner Spaza', x: 16, color: '#ae5243', ground: '#dfbc91', sign: 'SPAZA' }
];
export const STATIONS = LOTS.flatMap(({ x, color }) => [
  { x, z: 1.5, w: 4, d: 3, h: 1, color: '#b78862' },
  { x, z: 4.25, w: 4, d: 2.5, h: 3.4, color }
]);
export function buildable(x, z, w, d) {
  return (
    z >= -7 &&
    z + d <= 7 &&
    LOTS.some((l) => x >= l.x - 6 && x + w <= l.x + 6) &&
    !STATIONS.some(
      (s) =>
        x < s.x + s.w / 2 && x + w > s.x - s.w / 2 && z < s.z + s.d / 2 && z + d > s.z - s.d / 2
    )
  );
}
export function stationHeight(x, z) {
  for (const s of STATIONS)
    if (Math.abs(x - s.x) < s.w / 2 && Math.abs(z - s.z) < s.d / 2) return s.h;
  return 0;
}
export function checkpoint(stage) {
  if (stage < 2) return { x: -15.5, y: 0, z: -7.5 };
  return { x: LOTS[stage - 2].x + 0.5, y: 1, z: 1.5 };
}
export function atStop(stage, a) {
  const lot = LOTS[stage - 1];
  return (
    !!lot &&
    a.grounded &&
    Math.abs(a.y - 1) < 0.02 &&
    Math.abs(a.x - lot.x) < 1.75 &&
    a.z >= 0.45 &&
    a.z < 2.65
  );
}
