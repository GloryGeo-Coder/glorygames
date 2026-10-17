/* Existing six routes, followed by six new authored street environments. */
window.RacerRoutes = Object.freeze([
  {
    "title": "Coastal Sprint",
    "mission": "Palm trees, smooth roads, and light traffic.",
    "targetDistance": 1200,
    "baseSpeed": 36,
    "maxSpeed": 62,
    "spawnBase": 1.16,
    "pickupRate": 2,
    "hazardRate": 999,
    "curve": 1,
    "sky": [
      0.035,
      0.07,
      0.14
    ],
    "fog": [
      0.18,
      0.34,
      0.55
    ],
    "road": [
      0.11,
      0.115,
      0.13
    ],
    "shoulder": [
      0.16,
      0.28,
      0.16
    ],
    "terrainA": [
      0.1,
      0.4,
      0.18
    ],
    "terrainB": [
      0.45,
      0.34,
      0.2
    ],
    "env": "coast",
    "musicRoot": 110,
    "bonus": 800,
    "music": "sunset"
  },
  {
    "title": "Desert Boostway",
    "mission": "Cacti, rocks, faster traffic, and wider sightlines.",
    "targetDistance": 1500,
    "baseSpeed": 42,
    "maxSpeed": 72,
    "spawnBase": 0.98,
    "pickupRate": 1.85,
    "hazardRate": 4.4,
    "curve": 1.15,
    "sky": [
      0.09,
      0.06,
      0.035
    ],
    "fog": [
      0.55,
      0.38,
      0.18
    ],
    "road": [
      0.095,
      0.085,
      0.08
    ],
    "shoulder": [
      0.35,
      0.25,
      0.15
    ],
    "terrainA": [
      0.55,
      0.34,
      0.15
    ],
    "terrainB": [
      0.28,
      0.18,
      0.1
    ],
    "env": "desert",
    "musicRoot": 123.47,
    "bonus": 1100,
    "music": "sunset"
  },
  {
    "title": "Metro Night Run",
    "mission": "Neon towers, billboards, and hazard gates.",
    "targetDistance": 1800,
    "baseSpeed": 48,
    "maxSpeed": 80,
    "spawnBase": 0.86,
    "pickupRate": 1.7,
    "hazardRate": 3.4,
    "curve": 1.25,
    "sky": [
      0.018,
      0.025,
      0.07
    ],
    "fog": [
      0.12,
      0.2,
      0.55
    ],
    "road": [
      0.04,
      0.05,
      0.09
    ],
    "shoulder": [
      0.12,
      0.11,
      0.22
    ],
    "terrainA": [
      0.08,
      0.1,
      0.16
    ],
    "terrainB": [
      0.11,
      0.07,
      0.16
    ],
    "env": "metro",
    "musicRoot": 130.81,
    "bonus": 1500,
    "music": "midnight"
  },
  {
    "title": "Alpine Hyperpass",
    "mission": "Pine forests, cool colors, and sharper curves.",
    "targetDistance": 2100,
    "baseSpeed": 54,
    "maxSpeed": 88,
    "spawnBase": 0.78,
    "pickupRate": 1.6,
    "hazardRate": 2.8,
    "curve": 1.55,
    "sky": [
      0.045,
      0.07,
      0.09
    ],
    "fog": [
      0.4,
      0.55,
      0.68
    ],
    "road": [
      0.075,
      0.08,
      0.1
    ],
    "shoulder": [
      0.34,
      0.38,
      0.42
    ],
    "terrainA": [
      0.55,
      0.6,
      0.62
    ],
    "terrainB": [
      0.24,
      0.28,
      0.31
    ],
    "env": "alpine",
    "musicRoot": 146.83,
    "bonus": 1900,
    "music": "skyline"
  },
  {
    "title": "Jungle Storm Route",
    "mission": "Dense foliage, glowing pickups, and high pressure traffic.",
    "targetDistance": 2400,
    "baseSpeed": 58,
    "maxSpeed": 94,
    "spawnBase": 0.72,
    "pickupRate": 1.52,
    "hazardRate": 2.45,
    "curve": 1.7,
    "sky": [
      0.018,
      0.06,
      0.045
    ],
    "fog": [
      0.12,
      0.38,
      0.24
    ],
    "road": [
      0.05,
      0.065,
      0.055
    ],
    "shoulder": [
      0.1,
      0.23,
      0.12
    ],
    "terrainA": [
      0.08,
      0.32,
      0.1
    ],
    "terrainB": [
      0.03,
      0.16,
      0.08
    ],
    "env": "jungle",
    "musicRoot": 164.81,
    "bonus": 2300,
    "music": "skyline"
  },
  {
    "title": "Final Velocity",
    "mission": "Neon arches, hyper-road textures, and maximum speed.",
    "targetDistance": 2800,
    "baseSpeed": 64,
    "maxSpeed": 106,
    "spawnBase": 0.64,
    "pickupRate": 1.42,
    "hazardRate": 2.05,
    "curve": 1.85,
    "sky": [
      0.06,
      0.015,
      0.09
    ],
    "fog": [
      0.48,
      0.12,
      0.72
    ],
    "road": [
      0.05,
      0.04,
      0.07
    ],
    "shoulder": [
      0.18,
      0.08,
      0.24
    ],
    "terrainA": [
      0.18,
      0.08,
      0.25
    ],
    "terrainB": [
      0.08,
      0.06,
      0.12
    ],
    "env": "final",
    "musicRoot": 196,
    "bonus": 3000,
    "music": "voltage"
  },
  {
    "title": "Harbour Afterdark",
    "mission": "Race past freight cranes and stacked containers along the docks.",
    "env": "harbour",
    "music": "midnight",
    "targetDistance": 1800,
    "baseSpeed": 64,
    "maxSpeed": 100,
    "spawnBase": 0.76,
    "pickupRate": 1.6,
    "hazardRate": 2.8,
    "curve": 1.6,
    "sky": [
      0.025,
      0.055,
      0.085
    ],
    "fog": [
      0.05,
      0.15,
      0.19
    ],
    "road": [
      0.03,
      0.065,
      0.075
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 110,
    "bonus": 3200
  },
  {
    "title": "Old Town Boulevard",
    "mission": "Warm arcades, terrace streets and amber lighting.",
    "env": "oldtown",
    "music": "sunset",
    "targetDistance": 1920,
    "baseSpeed": 66,
    "maxSpeed": 103,
    "spawnBase": 0.736,
    "pickupRate": 1.56,
    "hazardRate": 2.6999999999999997,
    "curve": 1.6500000000000001,
    "sky": [
      0.09,
      0.055,
      0.07
    ],
    "fog": [
      0.22,
      0.12,
      0.13
    ],
    "road": [
      0.075,
      0.055,
      0.06
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 122,
    "bonus": 3450
  },
  {
    "title": "Industrial Ring",
    "mission": "Refinery towers, steel gantries and red warning beacons.",
    "env": "industrial",
    "music": "voltage",
    "targetDistance": 2040,
    "baseSpeed": 68,
    "maxSpeed": 106,
    "spawnBase": 0.712,
    "pickupRate": 1.52,
    "hazardRate": 2.5999999999999996,
    "curve": 1.7000000000000002,
    "sky": [
      0.055,
      0.045,
      0.065
    ],
    "fog": [
      0.16,
      0.09,
      0.08
    ],
    "road": [
      0.065,
      0.055,
      0.065
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 134,
    "bonus": 3700
  },
  {
    "title": "Neon Tunnel",
    "mission": "Race beneath illuminated tunnel ribs and cyan ceiling strips.",
    "env": "tunnel",
    "music": "voltage",
    "targetDistance": 2160,
    "baseSpeed": 70,
    "maxSpeed": 109,
    "spawnBase": 0.688,
    "pickupRate": 1.48,
    "hazardRate": 2.5,
    "curve": 1.75,
    "sky": [
      0.008,
      0.015,
      0.03
    ],
    "fog": [
      0.018,
      0.045,
      0.08
    ],
    "road": [
      0.03,
      0.04,
      0.06
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 146,
    "bonus": 3950
  },
  {
    "title": "Airport Express",
    "mission": "Terminal buildings, hangars and runway lighting at dusk.",
    "env": "airport",
    "music": "skyline",
    "targetDistance": 2280,
    "baseSpeed": 72,
    "maxSpeed": 112,
    "spawnBase": 0.664,
    "pickupRate": 1.4400000000000002,
    "hazardRate": 2.4,
    "curve": 1.8,
    "sky": [
      0.085,
      0.12,
      0.2
    ],
    "fog": [
      0.14,
      0.2,
      0.29
    ],
    "road": [
      0.065,
      0.08,
      0.11
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 158,
    "bonus": 4200
  },
  {
    "title": "Grand Prix Skyway",
    "mission": "Bridge pylons, suspension stays and the city skyline.",
    "env": "skyway",
    "music": "midnight",
    "targetDistance": 2400,
    "baseSpeed": 74,
    "maxSpeed": 115,
    "spawnBase": 0.64,
    "pickupRate": 1.4000000000000001,
    "hazardRate": 2.3,
    "curve": 1.85,
    "sky": [
      0.025,
      0.035,
      0.09
    ],
    "fog": [
      0.09,
      0.1,
      0.21
    ],
    "road": [
      0.045,
      0.045,
      0.085
    ],
    "shoulder": [
      0.1,
      0.13,
      0.17
    ],
    "terrainA": [
      0.1,
      0.12,
      0.16
    ],
    "terrainB": [
      0.07,
      0.09,
      0.14
    ],
    "musicRoot": 170,
    "bonus": 4450
  }
].map(Object.freeze));
