import { citizenAppearance, companionTrail } from './citizen-appearance.mjs';
import { surface } from './builder-geometry.mjs';

// A distinct shopper with a knitted cap, plum jacket and a reusable market bag.
export function residentFigure(B, scene, material, profile) {
  const hallVisitor = profile.destination === 'Community hall';
  const appearance = citizenAppearance(profile.key, profile.keeper);
  const root = new B.TransformNode('Resident ' + profile.name, scene),
    body = surface(B, scene);
  const { jacket, skin, cap } = appearance, navy = '#385263';
  const child = !!profile.child;
  if (child) root.scaling.setAll(0.66);
  body.profile(
    0,
    0,
    [
      [0.54, 0.17, 0.13],
      [0.65, 0.2, 0.15],
      [0.92, 0.22, 0.15],
      [1.01, 0.16, 0.12],
      [1.03, 0.08, 0.08]
    ],
    jacket
  );
  body.oval(0, 1.065, 0, 0.075, 0.12, 0.072, skin);
  body.oval(0, 1.265, 0, 0.202, 0.223, 0.172, skin, 22, 12);
  for (const side of [-1, 1]) {
    body.oval(side * 0.195, 1.25, 0, 0.035, 0.045, 0.028, skin);
    body.oval(side * 0.075, 1.284, 0.153, 0.034, 0.024, 0.013, '#ffecd5');
    body.oval(side * 0.076, 1.282, 0.167, 0.019, 0.019, 0.009, '#352522');
    body.cord(
      [
        [side * 0.042, 1.326, 0.157],
        [side * 0.078, 1.34, 0.15],
        [side * 0.113, 1.325, 0.133]
      ],
      0.008,
      '#44302a'
    );
  }
  body.oval(0, 1.232, 0.168, 0.031, 0.026, 0.028, skin);
  body.cord(
    [
      [-0.059, 1.194, 0.152],
      [0, 1.181, 0.165],
      [0.059, 1.194, 0.152]
    ],
    0.006,
    '#61352e'
  );
  body.profile(
    0,
    -0.009,
    [
      [1.346, 0.202, 0.172],
      [1.374, 0.215, 0.181],
      [appearance.style === 1 ? 1.41 : 1.46, 0.193, 0.161],
      [appearance.style === 1 ? 1.445 : 1.515, 0.122, 0.1],
      [appearance.style === 1 ? 1.46 : 1.54, 0.03, 0.025]
    ],
    appearance.style === 2 ? '#302622' : cap
  );
  body.profile(
    0,
    -0.009,
    [
      [1.346, 0.207, 0.177],
      [1.36, 0.218, 0.184],
      [1.394, 0.214, 0.181]
    ],
    appearance.style === 2 ? '#302622' : cap
  );
  if (!child) body.cord(
    [
      [-0.147, 1.0, 0.08],
      [-0.06, 0.85, 0.156],
      [0.055, 0.69, 0.15],
      [0.178, 0.58, 0.07]
    ],
    0.017,
    '#efcb7d'
  );
  if (profile.keeper) {
    body.profile(0, .158, [[.57, .17, .012], [.8, .16, .012], [.97, .12, .012]], '#f8e6ba');
    body.oval(0, .76, .179, .07, .05, .009, '#dfad47');
  }
  if (child && profile.visit === 'school') {
    body.oval(0, .77, -.15, .16, .19, .09, '#edaa36');
    for (const side of [-1, 1]) {
      body.cord([[side * .1, .96, -.13], [side * .12, 1, .04], [side * .12, .72, .14]], .018, '#ffd272');
    }
  }
  body.mesh(profile.name + ' coat and cap', root, material);
  const bag = surface(B, scene);
  bag.oval(0.194, 0.57, 0.057, 0.093, 0.1, 0.067, '#e2b771');
  if (!profile.keeper && !child) bag.mesh('Shopping bag', root, material);
  const groceries = surface(B, scene);
  if (hallVisitor) {
    // A blue library book peeks out of the satchel on the way home.
    groceries.profile(
      0.2,
      0.06,
      [
        [0.62, 0.061, 0.027],
        [0.72, 0.061, 0.027]
      ],
      '#3867a6'
    );
  } else if (profile.visit !== 'park') {
    groceries.oval(0.18, 0.665, 0.06, 0.037, 0.045, 0.036, '#85aa4b');
    groceries.oval(0.224, 0.659, 0.065, 0.032, 0.035, 0.031, '#ed963d');
  }
  const contents =
    profile.visit === 'park' || profile.visit === 'school' || profile.keeper || child
      ? null
      : groceries.mesh(
          hallVisitor
            ? profile.name + ' library book'
            : profile.key === 'resident'
              ? 'Shopping bag produce'
              : profile.name + ' groceries',
          root,
          material
        );
  const limbs = [-1, 1].map((side) => {
    const leg = new B.TransformNode('Resident leg', scene);
    leg.parent = root;
    leg.position.set(side * 0.1, 0.575, 0);
    const trousers = surface(B, scene);
    let knee = null;
    if (profile.visit === 'park') {
      trousers.profile(
        0,
        0,
        [
          [-0.26, 0.078, 0.084],
          [-0.04, 0.092, 0.106],
          [0.02, 0.083, 0.1]
        ],
        navy
      );
      trousers.mesh('Park visitor thigh', leg, material);
      knee = new B.TransformNode('Park visitor knee', scene);
      knee.parent = leg;
      knee.position.y = -0.25;
      const shin = surface(B, scene);
      shin.profile(
        0,
        0,
        [
          [-0.23, 0.071, 0.075],
          [0, 0.077, 0.087],
          [0.015, 0.072, 0.078]
        ],
        navy
      );
      shin.oval(0, -0.252, 0.032, 0.086, 0.066, 0.119, '#674938');
      shin.mesh('Park visitor shoe and shin', knee, material);
    } else {
      trousers.profile(
        0,
        0,
        [
          [-0.48, 0.071, 0.075],
          [-0.25, 0.077, 0.087],
          [-0.04, 0.092, 0.106],
          [0.02, 0.083, 0.1]
        ],
        navy
      );
      trousers.oval(0, -0.502, 0.032, 0.086, 0.066, 0.119, '#674938');
      trousers.mesh('Resident trousers', leg, material);
    }
    const arm = new B.TransformNode('Resident shoulder', scene);
    arm.parent = root;
    arm.position.set(side * 0.207, 0.936, 0);
    const sleeve = surface(B, scene);
    sleeve.oval(side * 0.02, -0.147, 0, 0.069, 0.192, 0.067, jacket);
    sleeve.oval(side * 0.027, -0.323, 0.012, 0.047, 0.069, 0.052, skin);
    sleeve.mesh('Resident sleeve', arm, material);
    return { leg, knee, arm, side };
  });
  root.setEnabled(false);
  const companion = profile.family && !child
    ? residentFigure(B, scene, material, { ...profile, family: false, child: true,
        name: (profile.childName || profile.name) + ' · child' }) : null;
  const trail = companion ? companionTrail() : null;
  let previousPhase = null, greetingUntil = 0, animationTime = 0;
  function show(trip, moving, t, waiting, seat, working = false) {
    root.setEnabled(!!trip);
    if (!trip) {
      trail?.reset();
      companion?.show(null, false, t, false, null);
      previousPhase = null;
      return;
    }
    if (!trip.paused) animationTime = t;
    if (trip.phase !== previousPhase) {
      if (trip.phase === 'shopping') greetingUntil = animationTime + 0.9;
      previousPhase = trip.phase;
    }
    const position = seat || trip;
    root.position.set(position.x, position.y, position.z);
    root.rotation.y = position.heading;
    contents?.setEnabled(!waiting && (trip.returning || trip.phase === 'shopping'));
    for (const { leg, knee, arm, side } of limbs) {
      const swing = moving ? side * Math.sin(animationTime * (child ? 11 : 9)) * 0.38 : 0;
      leg.rotation.x = seat ? -1.42 : swing;
      if (knee) knee.rotation.x = seat ? 1.48 : Math.max(0, -swing * 0.6);
      arm.rotation.z = 0;
      arm.rotation.x = working ? -.8 + Math.sin(animationTime * 5 + side) * .18
        : seat ? -0.48 : -swing - 0.09;
      if (!working && !moving && !seat && animationTime < greetingUntil && side === 1) {
        arm.rotation.x = -1.9;
        arm.rotation.z = 0.2 + Math.sin(animationTime * 14) * 0.13;
      } else if (!working && !moving && !seat) {
        arm.rotation.x += Math.sin(animationTime * 1.8 + side) * 0.035;
      }
    }
    if (companion) {
      const behind = trail.follow(trip);
      companion.show(behind && { ...trip, ...behind }, moving && !trip.paused,
        animationTime, false, null);
    }
  }
  return { root, show, dispose: () => { companion?.dispose(); root.dispose(); } };
}
