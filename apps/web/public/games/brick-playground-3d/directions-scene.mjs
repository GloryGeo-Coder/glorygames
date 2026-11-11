// A bounded pool of ground studs keeps town-scale routes inexpensive on phones.
export function directionsScene(B, scene) {
  const markers = [],
    teal = new B.StandardMaterial('Walking teal', scene),
    amber = new B.StandardMaterial('Blocked approach amber', scene);
  teal.diffuseColor = B.Color3.FromHexString('#15b9ad');
  teal.emissiveColor = B.Color3.FromHexString('#126c65');
  amber.diffuseColor = B.Color3.FromHexString('#ed982f');
  amber.emissiveColor = B.Color3.FromHexString('#704316');
  let previous;
  return (route) => {
    if (previous === route) return;
    previous = route;
    const spots = [],
      points = route?.state === 'arrived' ? [] : route?.points || [];
    let since = 0;
    for (let i = 1; i < points.length && spots.length < 64; i++) {
      const a = points[i - 1],
        b = points[i],
        d = Math.hypot(b.x - a.x, b.z - a.z);
      for (let n = 1.4 - since; n <= d && spots.length < 64; n += 1.4) {
        const t = n / d;
        spots.push({
          x: a.x + (b.x - a.x) * t,
          z: a.z + (b.z - a.z) * t,
          y: (a.y || 0) + ((b.y || 0) - (a.y || 0)) * t + 0.06
        });
      }
      since = (since + d) % 1.4;
    }
    if (route?.state === 'blocked' && points.length && spots.length < 64)
      spots.push({
        ...points.at(-1),
        y: (points.at(-1).y || 0) + 0.08,
        blocked: true
      });
    while (markers.length < spots.length) {
      const m = B.MeshBuilder.CreateCylinder(
        'Walking direction marker',
        { diameter: 0.36, height: 0.06, tessellation: 12 },
        scene
      );
      m.isPickable = false;
      markers.push(m);
    }
    markers.forEach((m, i) => {
      const p = spots[i];
      m.setEnabled(!!p);
      if (p) {
        m.position.set(p.x, p.y, p.z);
        m.material = p.blocked ? amber : teal;
      }
    });
  };
}
