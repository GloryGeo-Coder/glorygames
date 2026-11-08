const brick = (type, color, x, z, y = 0, r = 0) => ({ type, color, x, z, y, r });
function building(name, floors, bays, colour) {
  const pieces = [];
  for (let level = 0; level < floors; level++) {
    const y = (level * 10) / 3;
    for (let bay = 0; bay < bays; bay++) {
      const x = bay * 4;
      pieces.push(
        brick('floor', 'Chalk', x, 1, y),
        brick(level === 0 && bay === 0 ? 'door' : 'window', colour, x, 0, y + 1 / 3),
        brick('pillar', colour, x + 3, 0, y + 1 / 3),
        brick('wall', colour, x, 5, y + 1 / 3)
      );
      if (level === floors - 1) pieces.push(brick('floor', 'Ink', x, 1, y + 10 / 3));
    }
    pieces.push(
      brick('window', 'Sky', -1, 1, y + 1 / 3, 1),
      brick('window', 'Sky', bays * 4, 1, y + 1 / 3, 1)
    );
  }
  // A covered entrance and a contrasting roofline distinguish these buildings at street level.
  for (let bay = 0; bay < bays; bay++) pieces.push(brick('strip', 'Sun', bay * 4, 0, 10 / 3));
  for (let bay = 0; bay < bays; bay++)
    pieces.push(brick('strip', colour, bay * 4, 4, (floors * 10) / 3 + 1 / 3));
  if (floors > 1) pieces.push(brick('window', 'Sky', 0, 2, (floors * 10) / 3 + 1 / 3));
  return { name, pieces: pieces.map((p) => ({ ...p, x: p.x + 1 })) };
}
const house = building('Courtyard house', 1, 1, 'Coral');
export const CITY_PLANS = [
  house,
  building('Community hall', 1, 2, 'Lagoon'),
  building('Three-storey offices', 3, 1, 'Sky'),
  {
    name: 'Pocket park',
    pieces: [
      brick('strip', 'Chalk', 0, 2),
      brick('strip', 'Chalk', 4, 2),
      brick('bench', 'Sun', 2, 3),
      brick('pot', 'Leaf', 0, 0),
      brick('pot', 'Leaf', 6, 3)
    ]
  }
];

CITY_PLANS.push({
  name: 'Three-house street',
  pieces: [0, 7, 14].flatMap((offset, i) =>
    house.pieces.map((p) => ({
      ...p,
      x: p.x + offset,
      color: p.color === 'Coral' ? ['Coral', 'Lagoon', 'Plum'][i] : p.color
    }))
  )
});
