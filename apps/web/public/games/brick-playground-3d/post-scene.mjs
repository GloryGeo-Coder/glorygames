// Toy postboxes sit beside each entrance, leaving the opening free for the walker.
export function postScene(B, box, person) {
  let bag, previous, previousDoors;
  const boxes = [];
  function satchel() {
    bag = new B.TransformNode('Post satchel', person.getScene());
    bag.parent = person;
    box('Canvas mailbag', -0.27, 0.68, -0.045, 0.27, 0.3, 0.2, '#a53b35', bag);
    box('Cream envelope', -0.27, 0.86, -0.05, 0.23, 0.14, 0.04, '#fff3ca', bag).rotation.z = 0.12;
    box('Mailbag flap', -0.27, 0.76, -0.16, 0.29, 0.12, 0.04, '#d75940', bag);
    box('Brass clasp', -0.27, 0.72, -0.188, 0.065, 0.065, 0.03, '#f2b647', bag);
    box('Postbag strap', -0.16, 0.9, -0.14, 0.055, 0.52, 0.035, '#684938', bag).rotation.z = -0.48;
  }
  return (round, doors, carrying) => {
    if (carrying && !bag) satchel();
    bag?.setEnabled(carrying);
    if (previous === round && previousDoors === doors) return;
    previous = round;
    previousDoors = doors;
    for (const m of boxes) m.dispose();
    boxes.length = 0;
    if (!round || round.complete) return;
    for (const ref of [round.office, ...round.stops.filter((s) => !s.delivered)]) {
      const door = doors.get(ref.id);
      if (!door) continue;
      const { center, inside, y } = door.front,
        dx = (inside.x - center.x) / 1.5,
        dz = (inside.z - center.z) / 1.5;
      const root = new B.TransformNode('Postbox ' + ref.id, person.getScene());
      root.position.set(
        center.x + dz * 1.12 - dx * 0.53,
        y + 1.33,
        center.z - dx * 1.12 - dz * 0.53
      );
      root.rotation.y = Math.atan2(dx, dz);
      box(
        'Postbox case',
        0,
        0,
        0,
        0.46,
        0.58,
        0.18,
        ref === round.office ? '#28685c' : '#b34434',
        root
      );
      box('Letter slot', 0, 0.1, -0.103, 0.31, 0.055, 0.03, '#342e31', root);
      box('Address plate', 0, -0.06, -0.104, 0.23, 0.1, 0.03, '#ffdf9c', root);
      boxes.push(root);
    }
  };
}
