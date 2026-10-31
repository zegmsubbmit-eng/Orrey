/* =========================================================================
   ORRERY — Solar System Atlas
   data.js — the complete catalog: stars, planets, dwarf planets, moons,
   belts, comets and meteorites, with real physical data.
   ========================================================================= */

export const AU_KM = 149597870.7;

/* ----------------------------------------------------------------------- */
/*  Major bodies                                                           */
/* ----------------------------------------------------------------------- */

export const MAJOR = [
  {
    id: 'sun', name: 'Sun', type: 'star', cls: 'G2V yellow dwarf',
    radiusKm: 696340, mass: '1.989 × 10³⁰ kg', gravity: '274 m/s²',
    aAU: 0, e: 0, incDeg: 0, periodDays: 0, rotHours: 609.12, tiltDeg: 7.25,
    tempC: 5505, atmosphere: 'Hydrogen 73%, helium 25%',
    style: 'sun',
    desc: 'The Sun holds 99.86% of the mass of the solar system. In its core, 600 million tonnes of hydrogen fuse into helium every second, releasing the light that makes every world in this atlas possible.',
    facts: [
      'A photon born in the core takes up to 100,000 years to escape the Sun, then only 8 min 20 s to reach Earth.',
      'The visible surface, the photosphere, sits at about 5,500 °C — yet the corona above it exceeds 1,000,000 °C.',
      'The Sun is roughly 4.6 billion years old and is about halfway through its main-sequence life.'
    ]
  },
  {
    id: 'mercury', name: 'Mercury', type: 'planet', cls: 'Terrestrial planet',
    radiusKm: 2439.7, mass: '3.301 × 10²³ kg', gravity: '3.70 m/s²',
    aAU: 0.387098, e: 0.20563, incDeg: 7.005, periodDays: 87.969, rotHours: 1407.6, tiltDeg: 0.034,
    tempC: 167, atmosphere: 'Trace sodium, oxygen, hydrogen (exosphere)',
    style: 'rocky', palette: { base: '#8a817a', light: '#c9c1b4', dark: '#4b4642', accent: '#b9a68f' },
    desc: 'A cratered iron world with almost no atmosphere. Mercury swings from 430 °C in daylight to −180 °C at night — the most extreme temperature range of any planet.',
    facts: [
      'One solar day on Mercury lasts 176 Earth days — longer than its 88-day year.',
      'Its iron core fills about 85% of the planet’s radius.',
      'Water ice survives in permanently shadowed craters at the poles.'
    ]
  },
  {
    id: 'venus', name: 'Venus', type: 'planet', cls: 'Terrestrial planet',
    radiusKm: 6051.8, mass: '4.867 × 10²⁴ kg', gravity: '8.87 m/s²',
    aAU: 0.723332, e: 0.00677, incDeg: 3.395, periodDays: 224.701, rotHours: -5832.5, tiltDeg: 177.36,
    tempC: 464, atmosphere: 'CO₂ 96.5%, nitrogen 3.5%, sulfuric-acid clouds',
    style: 'venus', palette: { base: '#d8b878', light: '#f4e2b4', dark: '#9a7b45', accent: '#f7d9a0' },
    desc: 'Earth’s runaway twin. A 92-bar carbon-dioxide atmosphere and clouds of sulfuric acid trap heat until the surface glows at 464 °C — hotter than Mercury.',
    facts: [
      'Venus spins backwards, and one rotation takes 243 Earth days.',
      'Surface pressure equals being 900 m underwater on Earth.',
      'It is the brightest planet in our sky, often called the morning or evening star.'
    ]
  },
  {
    id: 'earth', name: 'Earth', type: 'planet', cls: 'Terrestrial planet',
    radiusKm: 6371, mass: '5.972 × 10²⁴ kg', gravity: '9.807 m/s²',
    aAU: 1.000001, e: 0.0167, incDeg: 0, periodDays: 365.256, rotHours: 23.9345, tiltDeg: 23.44,
    tempC: 15, atmosphere: 'Nitrogen 78%, oxygen 21%, argon 0.9%',
    style: 'earth', palette: { base: '#5d7a45', light: '#c9c2a4', dark: '#33452a', accent: '#3f6b8a' },
    desc: 'The only world known to hold life. Liquid water covers 71% of its surface, a magnetic field shields it from the solar wind, and its atmosphere keeps the mean temperature at a habitable 15 °C.',
    facts: [
      'Earth is the densest planet in the solar system at 5.51 g/cm³.',
      'Its Moon is unusually large — 1/4 of Earth’s diameter — and stabilises its axial tilt.',
      'The magnetosphere deflects the solar wind, painting auroras above the poles.'
    ]
  },
  {
    id: 'mars', name: 'Mars', type: 'planet', cls: 'Terrestrial planet',
    radiusKm: 3389.5, mass: '6.417 × 10²³ kg', gravity: '3.71 m/s²',
    aAU: 1.523679, e: 0.0934, incDeg: 1.85, periodDays: 686.98, rotHours: 24.6229, tiltDeg: 25.19,
    tempC: -65, atmosphere: 'CO₂ 95%, nitrogen 2.8%, argon 2%',
    style: 'mars', palette: { base: '#b4643a', light: '#e5a06a', dark: '#6d3520', accent: '#f0d9c0' },
    desc: 'A cold desert world of iron-oxide dust, polar ice and the largest volcano in the solar system. Dry river valleys hint at a warmer, wetter past.',
    facts: [
      'Olympus Mons rises 22 km — nearly three times the height of Everest.',
      'Valles Marineris is a canyon 4,000 km long and up to 7 km deep.',
      'Martian dust storms can envelop the entire planet for months.'
    ]
  },
  {
    id: 'jupiter', name: 'Jupiter', type: 'planet', cls: 'Gas giant',
    radiusKm: 69911, mass: '1.898 × 10²⁷ kg', gravity: '24.79 m/s²',
    aAU: 5.2044, e: 0.0489, incDeg: 1.303, periodDays: 4332.59, rotHours: 9.925, tiltDeg: 3.13,
    tempC: -110, atmosphere: 'Hydrogen 90%, helium 10%, traces of methane and ammonia',
    style: 'jupiter', palette: { base: '#c9a27a', light: '#f0dfc4', dark: '#8a5f3f', accent: '#b4553b' },
    desc: 'The giant of the family — 2.5 times more massive than all the other planets combined. Its banded clouds are the top of a 5,000 km deep hydrogen atmosphere.',
    facts: [
      'The Great Red Spot is a storm wider than Earth that has raged for at least 190 years.',
      'Jupiter’s magnetosphere is the largest structure in the solar system after the heliosphere.',
      'It rotates every 9 h 56 m — the fastest spin of any planet.'
    ]
  },
  {
    id: 'saturn', name: 'Saturn', type: 'planet', cls: 'Gas giant',
    radiusKm: 58232, mass: '5.683 × 10²⁶ kg', gravity: '10.44 m/s²',
    aAU: 9.5826, e: 0.0565, incDeg: 2.485, periodDays: 10759.22, rotHours: 10.656, tiltDeg: 26.73,
    tempC: -140, atmosphere: 'Hydrogen 96%, helium 3%, methane',
    style: 'saturn', palette: { base: '#d9c39a', light: '#f6ead0', dark: '#a98a5e', accent: '#c9b48a' },
    desc: 'The ringed jewel. Saturn is less dense than water, and its rings — 280,000 km across but often only 10 m thick — are made of countless icy fragments.',
    facts: [
      'Saturn’s rings are mostly water ice, from grains to house-sized boulders.',
      'Its north pole hosts a persistent hexagonal jet stream 30,000 km across.',
      'Saturn has 146 confirmed moons, the most of any planet.'
    ]
  },
  {
    id: 'uranus', name: 'Uranus', type: 'planet', cls: 'Ice giant',
    radiusKm: 25362, mass: '8.681 × 10²⁵ kg', gravity: '8.69 m/s²',
    aAU: 19.2184, e: 0.0463, incDeg: 0.773, periodDays: 30688.5, rotHours: -17.24, tiltDeg: 97.77,
    tempC: -195, atmosphere: 'Hydrogen 83%, helium 15%, methane 2%',
    style: 'uranus', palette: { base: '#9fe0e6', light: '#cdf4f7', dark: '#6bb6c2', accent: '#a9e8ee' },
    desc: 'A pale-cyan ice giant tipped on its side. Methane absorbs red light, giving Uranus its colour, while a sluggish hydrogen-helium atmosphere hides a hot, dense mantle of water, ammonia and methane ices.',
    facts: [
      'Uranus rotates at 98° — probably knocked over by a giant impact early in its history.',
      'Each pole spends 42 years in sunlight and 42 years in darkness.',
      'It is the coldest planetary atmosphere measured, dipping to −224 °C.'
    ]
  },
  {
    id: 'neptune', name: 'Neptune', type: 'planet', cls: 'Ice giant',
    radiusKm: 24622, mass: '1.024 × 10²⁶ kg', gravity: '11.15 m/s²',
    aAU: 30.11, e: 0.00946, incDeg: 1.77, periodDays: 60182, rotHours: 16.11, tiltDeg: 28.32,
    tempC: -200, atmosphere: 'Hydrogen 80%, helium 19%, methane 1.5%',
    style: 'neptune', palette: { base: '#2f5cba', light: '#6c9be8', dark: '#152f70', accent: '#0d1f4d' },
    desc: 'The furthest planet, a deep-blue ice giant where supersonic winds reach 2,100 km/h — the fastest in the solar system — despite receiving just 1/900 of Earth’s sunlight.',
    facts: [
      'Neptune was predicted mathematically before it was seen, discovered in 1846.',
      'The Great Dark Spot, a storm the size of Earth, was imaged by Voyager 2 in 1989.',
      'Its moon Triton orbits backwards and is likely a captured Kuiper Belt object.'
    ]
  },

  /* ---------------------------- dwarf planets ---------------------------- */
  {
    id: 'ceres', name: 'Ceres', type: 'dwarf', cls: 'Dwarf planet · asteroid belt',
    radiusKm: 473, mass: '9.38 × 10²⁰ kg', gravity: '0.28 m/s²',
    aAU: 2.7675, e: 0.0758, incDeg: 10.59, periodDays: 1681.6, rotHours: 9.074, tiltDeg: 4,
    tempC: -105, atmosphere: 'Transient water vapour',
    style: 'icy', palette: { base: '#8f8c86', light: '#c3bfb7', dark: '#565350', accent: '#dfe6ea' },
    desc: 'The largest object in the asteroid belt and the only dwarf planet inside Neptune’s orbit. Bright carbonate salts in Occator Crater mark briny water that reached the surface.',
    facts: [
      'Ceres holds about a quarter of the mass of the entire asteroid belt.',
      'Its bright spots are sodium-carbonate deposits left by evaporating brine.',
      'It may hide a weak subsurface ocean or mud layer.'
    ]
  },
  {
    id: 'pluto', name: 'Pluto', type: 'dwarf', cls: 'Dwarf planet · Kuiper Belt',
    radiusKm: 1188.3, mass: '1.303 × 10²² kg', gravity: '0.62 m/s²',
    aAU: 39.482, e: 0.2488, incDeg: 17.16, periodDays: 90560, rotHours: -153.29, tiltDeg: 122.53,
    tempC: -229, atmosphere: 'Thin nitrogen, methane, carbon monoxide',
    style: 'pluto', palette: { base: '#b08b72', light: '#e6d2bc', dark: '#6a4a3a', accent: '#f2e6d8' },
    desc: 'A geologically alive dwarf planet. Sputnik Planitia, the smooth nitrogen-ice heart, is a 1,000 km basin of convecting glaciers, ringed by water-ice mountains 3 km high.',
    facts: [
      'Pluto’s diameter is 2,377 km — about two-thirds of the Moon’s.',
      'Charon is half Pluto’s size; the pair are tidally locked and orbit a point outside Pluto.',
      'A Plutonian year lasts 248 Earth years; its orbit crosses inside Neptune’s.'
    ]
  },
  {
    id: 'haumea', name: 'Haumea', type: 'dwarf', cls: 'Dwarf planet · Kuiper Belt',
    radiusKm: 780, mass: '4.01 × 10²¹ kg', gravity: '0.44 m/s²',
    aAU: 43.13, e: 0.195, incDeg: 28.19, periodDays: 103660, rotHours: 3.915, tiltDeg: 0,
    tempC: -241, atmosphere: 'None detected',
    style: 'icy', palette: { base: '#d8d4cc', light: '#f2efe9', dark: '#9a958c', accent: '#ffffff' },
    desc: 'An egg-shaped dwarf planet spinning once every 3.9 hours — so fast that it is stretched into an ellipsoid 2,100 km long. It has a thin ring and two moons.',
    facts: [
      'Haumea’s day is shorter than any other known body over 100 km across.',
      'A ring of debris orbits at 2,287 km radius, discovered in 2017.',
      'Its surface is crystalline water ice, suggesting recent resurfacing.'
    ]
  },
  {
    id: 'makemake', name: 'Makemake', type: 'dwarf', cls: 'Dwarf planet · Kuiper Belt',
    radiusKm: 715, mass: '3.1 × 10²¹ kg', gravity: '0.5 m/s²',
    aAU: 45.79, e: 0.159, incDeg: 29.0, periodDays: 112897, rotHours: 22.83, tiltDeg: 0,
    tempC: -239, atmosphere: 'Possible transient methane',
    style: 'icy', palette: { base: '#c8a487', light: '#e8d3ba', dark: '#8a6a52', accent: '#f4e9dc' },
    desc: 'A reddish Kuiper Belt dwarf planet coated in methane and ethane ices. It is the second-brightest object in the Belt after Pluto and has one small dark moon.',
    facts: [
      'Discovered in 2005, Makemake helped trigger the redefinition of “planet”.',
      'Its surface is covered with frozen methane grains up to 1 cm across.',
      'Moon MK2 is roughly 175 km across and dark as charcoal.'
    ]
  },
  {
    id: 'eris', name: 'Eris', type: 'dwarf', cls: 'Dwarf planet · scattered disc',
    radiusKm: 1163, mass: '1.66 × 10²² kg', gravity: '0.82 m/s²',
    aAU: 67.78, e: 0.44, incDeg: 44.04, periodDays: 203830, rotHours: 379.2, tiltDeg: 78,
    tempC: -243, atmosphere: 'Frozen methane, possible nitrogen',
    style: 'icy', palette: { base: '#d9d6ce', light: '#f5f2ea', dark: '#96928a', accent: '#ffffff' },
    desc: 'The most massive dwarf planet, and the discovery that forced astronomers to define the word “planet” in 2006. Eris is currently near aphelion, 96 AU from the Sun.',
    facts: [
      'Eris is 27% more massive than Pluto but slightly smaller in diameter.',
      'Its moon Dysnomia is locked in a 15.8-day orbit.',
      'At aphelion, sunlight takes more than 13 hours to reach it.'
    ]
  },
  {
    id: 'gonggong', name: 'Gonggong', type: 'dwarf', cls: 'Dwarf planet · scattered disc',
    radiusKm: 615, mass: '1.75 × 10²¹ kg', gravity: '0.31 m/s²',
    aAU: 67.38, e: 0.5, incDeg: 30.7, periodDays: 201760, rotHours: 22.4, tiltDeg: 0,
    tempC: -243, atmosphere: 'None detected',
    style: 'icy', palette: { base: '#a85b45', light: '#d08a70', dark: '#6d3327', accent: '#e8b9a2' },
    desc: 'A large, deep-red scattered-disc object with a slow 22-hour spin and one moon, Xiangliu. Its colour comes from irradiated organic tholins.',
    facts: [
      'Officially named in 2020 after a Chinese water god.',
      'Its moon Xiangliu is about 100 km across.',
      'Gonggong’s orbit takes it 101 AU from the Sun at aphelion.'
    ]
  },
  {
    id: 'quaoar', name: 'Quaoar', type: 'dwarf', cls: 'Dwarf planet · Kuiper Belt',
    radiusKm: 545, mass: '1.2 × 10²¹ kg', gravity: '0.27 m/s²',
    aAU: 43.69, e: 0.039, incDeg: 8.0, periodDays: 105170, rotHours: 17.68, tiltDeg: 0,
    tempC: -233, atmosphere: 'Possible thin methane',
    style: 'icy', palette: { base: '#a9a29a', light: '#d8d2c8', dark: '#6e6963', accent: '#eae4da' },
    desc: 'A reddish Kuiper Belt dwarf planet with a surprising ring — located 4,100 km out, far beyond where rings were thought able to survive.',
    facts: [
      'Quaoar’s ring orbits at about 7.5 planetary radii, defying the Roche limit.',
      'It has one moon, Weywot, about 170 km across.',
      'Its surface shows both crystalline water ice and methane.'
    ]
  },
  {
    id: 'sedna', name: 'Sedna', type: 'dwarf', cls: 'Dwarf planet · detached object',
    radiusKm: 498, mass: '~1 × 10²¹ kg', gravity: '0.27 m/s²',
    aAU: 506, e: 0.855, incDeg: 11.93, periodDays: 11400000, rotHours: 10.273, tiltDeg: 0,
    tempC: -261, atmosphere: 'None',
    style: 'icy', palette: { base: '#a8563c', light: '#cf8060', dark: '#652b1c', accent: '#e7b7a0' },
    desc: 'One of the most distant known solar-system bodies. Sedna never comes closer than 76 AU and takes about 11,400 years to circle the Sun — a fossil from the Sun’s birth cluster.',
    facts: [
      'Sedna is one of the reddest objects in the solar system.',
      'Its orbit is so eccentric that it is classified as a detached object.',
      'No spacecraft has ever visited; even New Horizons would take decades.'
    ]
  },
  {
    id: 'orcus', name: 'Orcus', type: 'dwarf', cls: 'Dwarf planet · Kuiper Belt',
    radiusKm: 458, mass: '6.3 × 10²⁰ kg', gravity: '0.2 m/s²',
    aAU: 39.17, e: 0.22, incDeg: 20.59, periodDays: 90560, rotHours: 13.19, tiltDeg: 0,
    tempC: -231, atmosphere: 'None',
    style: 'icy', palette: { base: '#9aa3a8', light: '#ccd4d8', dark: '#606a70', accent: '#e8eef0' },
    desc: 'The “anti-Pluto”: Orcus shares Pluto’s orbital period and a similar 2:3 resonance with Neptune, but sits on the opposite side of its orbit. Its moon is Vanth.',
    facts: [
      'Orcus and Pluto are in a 2:3 mean-motion resonance with Neptune.',
      'Vanth is about 440 km across — nearly half Orcus’s diameter.',
      'Its surface is water ice mixed with dark tholins.'
    ]
  }
];

/* ----------------------------------------------------------------------- */
/*  Moons — [name, parent, radiusKm, orbitRadiusKm, periodDays, note, tint] */
/* ----------------------------------------------------------------------- */

const MOON_ROWS = [
  ['Luna', 'earth', 1737.4, 384400, 27.322, 'Earth’s companion, born from a giant impact 4.5 billion years ago. Its far side is a rugged highland crust; the near side is flooded with dark maria.', '#a6a49d'],
  ['Phobos', 'mars', 11.27, 9376, 0.3189, 'A tiny, battered moon spiralling inward. It rises in the west and sets in the east twice a Martian day.', '#8d7f70'],
  ['Deimos', 'mars', 6.2, 23463, 1.263, 'The smaller, smoother Martian moon — likely a captured asteroid blanketed in dust.', '#a08e7c'],
  ['Io', 'jupiter', 1821.6, 421700, 1.769, 'The most volcanically active world known: 400 active volcanoes, driven by tidal flexing from Jupiter.', '#e8d36a'],
  ['Europa', 'jupiter', 1560.8, 671034, 3.551, 'A cracked shell of ice over a global salt-water ocean holding twice Earth’s water. Prime target in the search for life.', '#e3ddd0'],
  ['Ganymede', 'jupiter', 2634.1, 1070412, 7.155, 'The largest moon in the solar system — bigger than Mercury — and the only moon with its own magnetic field.', '#a89b8a'],
  ['Callisto', 'jupiter', 2410.3, 1882709, 16.689, 'The most heavily cratered object known; its ancient surface has been unchanged for 4 billion years.', '#6f6257'],
  ['Amalthea', 'jupiter', 83.5, 181365, 0.498, 'A small, red, potato-shaped inner moon that feeds Jupiter’s faint gossamer ring.', '#a95f45'],
  ['Himalia', 'jupiter', 85, 11460000, 250.6, 'The largest of Jupiter’s irregular moons, probably a captured asteroid.', '#8a7767'],
  ['Elara', 'jupiter', 43, 11740000, 259.6, 'A dark irregular moon in the Himalia group, only 43 km across.', '#7d7065'],
  ['Pasiphae', 'jupiter', 30, 23624000, 743.6, 'A retrograde irregular moon, orbiting opposite to Jupiter’s spin — a captured body.', '#8f8578'],
  ['Sinope', 'jupiter', 19, 23939000, 758.9, 'One of the most distant Jovian moons, in a retrograde, highly inclined orbit.', '#928579'],
  ['Carme', 'jupiter', 23, 23404000, 734.2, 'A retrograde irregular moon with a reddish surface, likely a collision fragment.', '#8b7a6b'],
  ['Ananke', 'jupiter', 14, 21276000, 629.8, 'A tiny retrograde moon, one of the darkest objects in the solar system.', '#6d665f'],
  ['Titan', 'saturn', 2574.7, 1221870, 15.945, 'The only moon with a substantial atmosphere — thick orange nitrogen haze over lakes of liquid methane.', '#d9a25c'],
  ['Rhea', 'saturn', 763.8, 527108, 4.518, 'A bright, heavily cratered ice moon, Saturn’s second largest.', '#d7d2c6'],
  ['Enceladus', 'saturn', 252.1, 238020, 1.370, 'An ice moon with a subsurface ocean erupting through fractures at its south pole, feeding Saturn’s E ring.', '#f2f4f0'],
  ['Mimas', 'saturn', 198.2, 185539, 0.942, 'The “Death Star” moon, dominated by the 130 km Herschel Crater.', '#cfcbc2'],
  ['Iapetus', 'saturn', 734.5, 3560820, 79.32, 'A two-toned world: one hemisphere is snow-white, the other coal-dark.', '#9c9184'],
  ['Dione', 'saturn', 561.4, 377396, 2.737, 'An icy moon with bright cliff networks and a thin oxygen exosphere.', '#cdc8bc'],
  ['Tethys', 'saturn', 531.1, 294619, 1.888, 'A nearly pure water-ice moon, split by the 2,000 km Ithaca Chasma.', '#dcdcd4'],
  ['Hyperion', 'saturn', 135, 1481009, 21.277, 'A chaotic, sponge-like moon whose rotation has no stable period.', '#b3a18e'],
  ['Phoebe', 'saturn', 106.5, 12947000, 550.3, 'A dark, retrograde moon, likely a captured Kuiper Belt object.', '#6b5f54'],
  ['Atlas', 'saturn', 15.1, 137670, 0.602, 'A tiny shepherd moon with a distinctive flying-saucer ridge.', '#c9c4b8'],
  ['Prometheus', 'saturn', 43.1, 139380, 0.613, 'A shepherd moon whose gravity carves the narrow F ring.', '#c2bdb1'],
  ['Pandora', 'saturn', 40.7, 141720, 0.629, 'The outer F-ring shepherd, irregularly shaped and icy.', '#c8c3b6'],
  ['Miranda', 'uranus', 235.8, 129390, 1.413, 'A patchwork moon with Verona Rupes, a 20 km cliff — the tallest known.', '#bdbdb8'],
  ['Ariel', 'uranus', 578.9, 190900, 2.520, 'The brightest Uranian moon, with young-looking valleys and ice flows.', '#d3d3cc'],
  ['Umbriel', 'uranus', 584.7, 266000, 4.144, 'The darkest large Uranian moon, named after a melancholy sprite.', '#8a8b88'],
  ['Titania', 'uranus', 788.4, 436300, 8.706, 'The largest Uranian moon, scarred by enormous canyons.', '#c4c1b8'],
  ['Oberon', 'uranus', 761.4, 583500, 13.463, 'The outermost major moon of Uranus, ancient and cratered.', '#b0a8a0'],
  ['Cordelia', 'uranus', 20, 49770, 0.335, 'A small inner shepherd moon of Uranus’s epsilon ring.', '#a9b0b0'],
  ['Ophelia', 'uranus', 21.4, 53790, 0.376, 'Shepherd moon sharing an orbit with Cordelia, bracketing the epsilon ring.', '#adb3b2'],
  ['Bianca', 'uranus', 25.7, 59170, 0.435, 'One of Uranus’s small inner moons, discovered by Voyager 2 in 1986.', '#b3b8b5'],
  ['Cressida', 'uranus', 39.8, 61770, 0.464, 'An inner moon orbiting inside Uranus’s synchronous radius.', '#b8bcb8'],
  ['Desdemona', 'uranus', 32, 62660, 0.474, 'A small, dark inner moon of Uranus.', '#b2b6b2'],
  ['Juliet', 'uranus', 46.8, 64360, 0.493, 'The largest of Uranus’s inner moons after Puck.', '#bcc0bb'],
  ['Portia', 'uranus', 67.6, 66100, 0.513, 'A dark inner moon that may one day collide with Uranus.', '#b5b9b4'],
  ['Rosalind', 'uranus', 36, 69930, 0.558, 'A tiny inner moon in Uranus’s crowded ring region.', '#b0b4b0'],
  ['Belinda', 'uranus', 40.3, 75260, 0.624, 'An elliptical inner moon with a dark, carbonaceous surface.', '#b4b7b3'],
  ['Puck', 'uranus', 81, 86010, 0.762, 'The largest inner moon of Uranus, discovered by Voyager 2.', '#9da09b'],
  ['Sycorax', 'uranus', 75, 12179000, 1288.3, 'The largest retrograde irregular moon of Uranus, captured from the Kuiper Belt.', '#7b6f64'],
  ['Triton', 'neptune', 1353.4, 354759, 5.877, 'A captured Kuiper Belt world with nitrogen geysers, retrograde orbit and a slowly decaying path toward Neptune.', '#d6cfc4'],
  ['Nereid', 'neptune', 170, 5513800, 360.14, 'A small moon in one of the most eccentric orbits known.', '#a8a39a'],
  ['Proteus', 'neptune', 210, 117647, 1.122, 'A boxy, dark moon — the largest irregularly shaped body in the solar system.', '#85837c'],
  ['Larissa', 'neptune', 97, 73548, 0.555, 'A small inner moon, probably a re-accreted fragment.', '#8f8d85'],
  ['Galatea', 'neptune', 88, 62000, 0.429, 'A shepherd moon whose gravity shapes Neptune’s Adams ring.', '#9a978f'],
  ['Despina', 'neptune', 78, 52526, 0.335, 'An inner moon that shepherds Neptune’s Leverrier ring.', '#99968e'],
  ['Thalassa', 'neptune', 41, 50075, 0.311, 'A tiny inner moon, only 82 km across.', '#96938b'],
  ['Naiad', 'neptune', 33, 48227, 0.294, 'The innermost moon of Neptune, on a decaying orbit.', '#939088'],
  ['Charon', 'pluto', 606, 19591, 6.387, 'Half the size of Pluto, locked face-to-face with it in a mutual tidal embrace.', '#a9a6a0'],
  ['Nix', 'pluto', 23, 48694, 24.85, 'A tiny, bright, tumbling moon of Pluto.', '#d8d5cf'],
  ['Styx', 'pluto', 12, 42656, 20.16, 'The smallest known Plutonian moon, discovered in 2012.', '#c7c4be'],
  ['Kerberos', 'pluto', 9, 57783, 32.17, 'A small, dark moon with a highly reflective patch.', '#9b9892'],
  ['Hydra', 'pluto', 25.5, 64738, 38.20, 'The outermost of Pluto’s five moons, irregular and bright.', '#cdcac4'],
  ['Hiʻiaka', 'haumea', 160, 49880, 49.12, 'The larger of Haumea’s two moons, with a deep water-ice absorption spectrum.', '#d5d2ca'],
  ['Namaka', 'haumea', 85, 25657, 18.28, 'The smaller, inner moon of Haumea.', '#c8c5bd'],
  ['Dysnomia', 'eris', 350, 37350, 15.77, 'Eris’s only known moon, dark and probably rich in organics.', '#7d746a'],
  ['MK2', 'makemake', 87.5, 21000, 12.4, 'A faint moon of Makemake discovered by Hubble in 2016.', '#6f6862']
];

const MOON_EXTRAS = {
  'Luna': { tempC: -20, atmosphere: 'Essentially none (exosphere)', gravity: '1.62 m/s²' },
  'Titan': { tempC: -179, atmosphere: 'Nitrogen 95%, methane 5%, organic haze', gravity: '1.35 m/s²' },
  'Io': { tempC: -143, atmosphere: 'Thin sulfur dioxide', gravity: '1.80 m/s²' },
  'Europa': { tempC: -160, atmosphere: 'Trace oxygen', gravity: '1.31 m/s²' },
  'Ganymede': { tempC: -163, atmosphere: 'Trace oxygen', gravity: '1.43 m/s²' },
  'Callisto': { tempC: -139, atmosphere: 'Trace carbon dioxide', gravity: '1.24 m/s²' },
  'Enceladus': { tempC: -198, atmosphere: 'Water-vapour plumes', gravity: '0.11 m/s²' },
  'Triton': { tempC: -235, atmosphere: 'Thin nitrogen', gravity: '0.78 m/s²' },
  'Charon': { tempC: -220, atmosphere: 'None', gravity: '0.29 m/s²' },
  'Mimas': { tempC: -209, atmosphere: 'None', gravity: '0.06 m/s²' },
  'Rhea': { tempC: -174, atmosphere: 'Trace oxygen', gravity: '0.26 m/s²' },
  'Dione': { tempC: -186, atmosphere: 'Trace oxygen', gravity: '0.23 m/s²' },
  'Tethys': { tempC: -187, atmosphere: 'Trace oxygen', gravity: '0.15 m/s²' },
  'Iapetus': { tempC: -143, atmosphere: 'None', gravity: '0.22 m/s²' },
  'Miranda': { tempC: -187, atmosphere: 'None', gravity: '0.08 m/s²' },
  'Ariel': { tempC: -213, atmosphere: 'None', gravity: '0.27 m/s²' },
  'Umbriel': { tempC: -198, atmosphere: 'None', gravity: '0.23 m/s²' },
  'Titania': { tempC: -203, atmosphere: 'Possible trace CO₂', gravity: '0.38 m/s²' },
  'Oberon': { tempC: -198, atmosphere: 'None', gravity: '0.35 m/s²' },
  'Phobos': { tempC: -40, atmosphere: 'None', gravity: '0.0057 m/s²' },
  'Deimos': { tempC: -40, atmosphere: 'None', gravity: '0.003 m/s²' },
  'Pluto': {}
};

export const MOONS = MOON_ROWS.map(([name, parent, radiusKm, orbitKm, periodDays, note, tint], i) => ({
  id: 'm-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name, type: 'moon', parent, radiusKm, orbitKm, aAU: 0, e: 0.001, incDeg: 0,
  periodDays, rotHours: periodDays * 24, tiltDeg: 0, tempC: -170, atmosphere: 'None',
  style: 'moon', palette: { base: tint, light: '#ffffff', dark: '#2a2724', accent: tint },
  note, desc: note, facts: [],
  orbitRadiusKm: orbitKm, _idx: i,
  ...(MOON_EXTRAS[name] || {})
}));

/* ----------------------------------------------------------------------- */
/*  Belts, comets, meteorites                                              */
/* ----------------------------------------------------------------------- */

export const BELTS = [
  {
    id: 'asteroid-belt', name: 'Asteroid Belt', type: 'belt', cls: 'Debris region',
    radiusKm: 0, aAU: 2.7, e: 0, incDeg: 0, periodDays: 1600, rotHours: 0, tiltDeg: 0,
    tempC: -100, atmosphere: 'None', style: 'belt', rangeAU: [2.06, 3.28],
    desc: 'A torus of rocky debris between Mars and Jupiter, containing millions of objects larger than 1 km. Together they hold only about 4% of the Moon’s mass.',
    facts: [
      'The largest object is Ceres, followed by Vesta, Pallas and Hygiea.',
      'Despite the movies, the average separation between belt asteroids is millions of kilometres.',
      'Jupiter’s gravity carved the belt’s Kirkwood gaps and resonances.'
    ]
  },
  {
    id: 'kuiper-belt', name: 'Kuiper Belt', type: 'belt', cls: 'Debris region',
    radiusKm: 0, aAU: 44, e: 0, incDeg: 0, periodDays: 105000, rotHours: 0, tiltDeg: 0,
    tempC: -230, atmosphere: 'None', style: 'belt-kuiper', rangeAU: [30, 50],
    desc: 'A vast, cold ring of icy planetesimals beyond Neptune — home to Pluto, Eris, Haumea, Makemake and hundreds of thousands of smaller bodies.',
    facts: [
      'The Kuiper Belt is 20 times wider than the asteroid belt and far more massive.',
      'Short-period comets such as Halley-type bodies originate here and in the scattered disc.',
      'Its inner edge at 30 AU is sculpted by Neptune’s resonances.'
    ]
  },
  {
    id: 'oort-cloud', name: 'Oort Cloud', type: 'belt', cls: 'Cometary reservoir',
    radiusKm: 0, aAU: 20000, e: 0, incDeg: 0, periodDays: 0, rotHours: 0, tiltDeg: 0,
    tempC: -268, atmosphere: 'None', style: 'belt-oort', rangeAU: [2000, 100000],
    desc: 'A spherical swarm of trillions of icy bodies surrounding the Sun out to perhaps 100,000 AU. It is the source of long-period comets and the boundary of the Sun’s gravitational domain.',
    facts: [
      'The Oort Cloud has never been observed directly — its existence is inferred from comet orbits.',
      'Its outer edge may reach a third of the way to the next star.',
      'Voyager 1 will take about 300 years to reach its inner edge.'
    ]
  }
];

export const COMETS = [
  {
    id: 'halley', name: 'Halley’s Comet', type: 'comet', cls: 'Periodic comet · 1P/Halley',
    radiusKm: 5.5, aAU: 17.83, e: 0.967, incDeg: 162.26, periodDays: 27510, rotHours: 52.8, tiltDeg: 0,
    tempC: -70, atmosphere: 'Coma of water vapour, CO, CO₂, dust', style: 'comet',
    palette: { base: '#9d968c', light: '#d8d3c9', dark: '#4a463f', accent: '#bff0ff' },
    desc: 'The most famous comet, returning every 75–76 years. Its dust stream produces the Orionid and Eta Aquariid meteor showers each year.',
    facts: [
      'Recorded by astronomers for more than 2,200 years.',
      'Its last perihelion was in 1986; it returns in 2061.',
      'The Giotto probe flew 596 km from its nucleus in 1986 and found a dark, peanut-shaped body.'
    ]
  },
  {
    id: 'hale-bopp', name: 'Comet Hale-Bopp', type: 'comet', cls: 'Long-period comet · C/1995 O1',
    radiusKm: 30, aAU: 186, e: 0.995, incDeg: 89.43, periodDays: 925000, rotHours: 11.7, tiltDeg: 0,
    tempC: -100, atmosphere: 'Water, CO, dust coma', style: 'comet',
    palette: { base: '#b9b2a6', light: '#f2eee6', dark: '#5c564b', accent: '#c9f2ff' },
    desc: 'The “Great Comet of 1997”, visible to the naked eye for 18 months. Its enormous nucleus, 60 km across, produced spectacular dust and ion tails.',
    facts: [
      'It was discovered independently by Alan Hale and Thomas Bopp in July 1995.',
      'Its perihelion in April 1997 was 0.91 AU from the Sun.',
      'Hale-Bopp will not return for about 2,500 years.'
    ]
  },
  {
    id: 'hyakutake', name: 'Comet Hyakutake', type: 'comet', cls: 'Long-period comet · C/1996 B2',
    radiusKm: 2.5, aAU: 1700, e: 0.999, incDeg: 124.9, periodDays: 2550000, rotHours: 6.2, tiltDeg: 0,
    tempC: -110, atmosphere: 'Water vapour, ethane, methane coma', style: 'comet',
    palette: { base: '#a9a49a', light: '#e6e2da', dark: '#4f4a42', accent: '#b6f0ff' },
    desc: 'The “Great Comet of 1996”, which passed just 0.10 AU from Earth. It revealed the first confirmed X-ray emission from a comet.',
    facts: [
      'Its tail stretched more than 100° across the sky.',
      'It passed Earth at 15 million km — one of the closest comet approaches in history.',
      'Its return is expected in roughly 70,000 years.'
    ]
  },
  {
    id: 'neowise', name: 'Comet NEOWISE', type: 'comet', cls: 'Long-period comet · C/2020 F3',
    radiusKm: 2.5, aAU: 358, e: 0.9992, incDeg: 128.94, periodDays: 2420000, rotHours: 7.6, tiltDeg: 0,
    tempC: -120, atmosphere: 'Water and CO₂ coma', style: 'comet',
    palette: { base: '#aaa59b', light: '#eeeae2', dark: '#4d4841', accent: '#a9ecff' },
    desc: 'The brightest comet visible from the northern hemisphere since Hale-Bopp. Its split dust tail and blue ion tail delighted observers in July 2020.',
    facts: [
      'Discovered by the NEOWISE infrared space telescope on 27 March 2020.',
      'Its close approach to Earth was 0.69 AU in July 2020.',
      'Its orbit will not return for about 6,800 years.'
    ]
  },
  {
    id: 'shoemaker-levy-9', name: 'Comet Shoemaker-Levy 9', type: 'comet', cls: 'Jupiter-family comet',
    radiusKm: 1.8, aAU: 5.2, e: 0.216, incDeg: 6.0, periodDays: 730, rotHours: 0, tiltDeg: 0,
    tempC: -130, atmosphere: 'Fragmented nucleus', style: 'comet',
    palette: { base: '#8d867a', light: '#c7c1b6', dark: '#403c35', accent: '#b9e8ff' },
    desc: 'A comet torn apart by Jupiter’s tides, then crashed into the planet in July 1994. The impacts left dark scars larger than Earth and were watched by every major observatory.',
    facts: [
      'It was discovered in March 1993 orbiting Jupiter, not the Sun.',
      'Twenty-one fragments struck Jupiter between 16 and 22 July 1994.',
      'The impact energy of fragment G rivalled 6 million megatons of TNT.'
    ]
  },
  {
    id: 'mcnaught', name: 'Comet McNaught', type: 'comet', cls: 'Long-period comet · C/2006 P1',
    radiusKm: 5, aAU: 1900, e: 0.9996, incDeg: 128.6, periodDays: 2900000, rotHours: 0, tiltDeg: 0,
    tempC: -110, atmosphere: 'Dust and ion coma', style: 'comet',
    palette: { base: '#b6afa2', light: '#f4f0e8', dark: '#575247', accent: '#ffe8b0' },
    desc: 'The “Great Comet of 2007”, so bright it was visible in daylight. Its sweeping fan of dust was photographed from the southern hemisphere for weeks.',
    facts: [
      'It reached magnitude −5.5 at perihelion in January 2007.',
      'It passed just 0.17 AU from the Sun.',
      'Its orbit is nearly parabolic, returning in about 92,000 years.'
    ]
  }
];

export const METEORITES = [
  {
    id: 'hoba', name: 'Hoba', type: 'meteoroid', cls: 'Iron meteorite · Namibia',
    radiusKm: 1.4, aAU: 1.2, e: 0.1, incDeg: 3, periodDays: 480, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#4e4a45', light: '#8f8a80', dark: '#26231f', accent: '#a08a6a' },
    desc: 'The largest known meteorite on Earth: a 60-tonne slab of iron-nickel that fell in Namibia some 80,000 years ago and never moved again.',
    facts: ['It measures 2.7 × 2.7 × 0.9 m and is about 84% iron.', 'It was declared a national monument in 1955.', 'No crater surrounds it — it likely hit at a shallow angle and low speed.'],
    mass: '60,000 kg', found: '1920, Grootfontein, Namibia'
  },
  {
    id: 'allende', name: 'Allende', type: 'meteoroid', cls: 'Carbonaceous chondrite · Mexico',
    radiusKm: 0.9, aAU: 1.4, e: 0.2, incDeg: 5, periodDays: 600, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#57524a', light: '#98928a', dark: '#2b2823', accent: '#d8cbb8' },
    desc: 'A 2-tonne carbonaceous chondrite that fell over Mexico in 1969. It contains calcium-aluminium inclusions — the oldest solids ever dated, 4.567 billion years old.',
    facts: ['It is one of the most studied meteorites in history.', 'Its CAIs date to the birth of the solar system.', 'It contains amino acids and presolar grains.'],
    mass: '~2,000 kg', found: '8 February 1969, Chihuahua, Mexico'
  },
  {
    id: 'chelyabinsk', name: 'Chelyabinsk', type: 'meteoroid', cls: 'Ordinary chondrite · Russia',
    radiusKm: 10, aAU: 1.7, e: 0.5, incDeg: 4, periodDays: 900, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#6b655c', light: '#a8a196', dark: '#38342e', accent: '#c8bca8' },
    desc: 'A 20 m asteroid that exploded over Chelyabinsk in 2013 with 30 times the energy of the Hiroshima bomb, shattering windows across the city and injuring 1,600 people.',
    facts: ['The airburst occurred at about 30 km altitude.', 'The largest recovered fragment weighed 654 kg.', 'It was the largest known impact on Earth since Tunguska in 1908.'],
    mass: '~12,000 tonnes (initial)', found: '15 February 2013, Chelyabinsk, Russia'
  },
  {
    id: 'alh84001', name: 'ALH 84001', type: 'meteoroid', cls: 'Martian meteorite · Antarctica',
    radiusKm: 0.85, aAU: 1.52, e: 0.09, incDeg: 2, periodDays: 687, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#5c554b', light: '#9a9286', dark: '#2d2923', accent: '#c2b49e' },
    desc: 'A 4.1-billion-year-old piece of Mars, blasted off the planet and found in Antarctica in 1984. In 1996 it became famous for possible fossil evidence of ancient Martian life.',
    facts: ['It is an orthopyroxenite — a rock type rare on Earth.', 'It contains carbonate globules formed in water.', 'The “fossils” remain controversial; most scientists favour abiotic explanations.'],
    mass: '1.93 kg', found: '1984, Allan Hills, Antarctica'
  },
  {
    id: 'sylacauga', name: 'Sylacauga', type: 'meteoroid', cls: 'Ordinary chondrite · USA',
    radiusKm: 0.4, aAU: 1.1, e: 0.15, incDeg: 6, periodDays: 420, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#6a6459', light: '#a8a096', dark: '#34302a', accent: '#c9bda9' },
    desc: 'The first documented meteorite to strike a person. On 30 November 1954 a grapefruit-sized stone crashed through the roof of Ann Hodges’s home in Alabama and bruised her hip.',
    facts: ['The meteorite broke into three fragments.', 'It is classified as an H4 chondrite.', 'The event helped establish legal questions about ownership of fallen meteorites.'],
    mass: '5.56 kg', found: '30 November 1954, Sylacauga, Alabama'
  },
  {
    id: 'willamette', name: 'Willamette', type: 'meteoroid', cls: 'Iron meteorite · USA',
    radiusKm: 1.1, aAU: 1.3, e: 0.12, incDeg: 2, periodDays: 540, rotHours: 0, tiltDeg: 0,
    tempC: 25, atmosphere: 'None', style: 'meteorite',
    palette: { base: '#4a4741', light: '#8c887e', dark: '#232120', accent: '#967f60' },
    desc: 'The largest meteorite ever found in the United States — a 15.5-tonne iron mass, and the largest meteorite displayed in any museum in the world.',
    facts: ['It is the sixth-largest meteorite ever found.', 'It was used by Native Americans as a source of metal.', 'It is on display at the American Museum of Natural History.'],
    mass: '15,500 kg', found: '1902, West Linn, Oregon'
  }
];

/* ----------------------------------------------------------------------- */
/*  Newsroom                                                               */
/* ----------------------------------------------------------------------- */

export const NEWS = [
  { id: 'n1', cat: 'Solar System', title: 'The heliosphere’s breathing edge', body: 'sun',
    teaser: 'New models suggest the Sun’s protective bubble expands and contracts with the solar cycle more than expected.',
    text: 'The heliosphere — the vast bubble of plasma the Sun blows into interstellar space — may change size by up to 15% over an 11-year solar cycle. Data from the Voyager probes and IBEX are being combined with magnetohydrodynamic models to map the heliopause, the boundary where the solar wind meets the interstellar medium. The work matters for how cosmic rays reach the inner solar system.' },
  { id: 'n2', cat: 'Impacts', title: 'Chelyabinsk, a decade of lessons', body: 'chelyabinsk',
    teaser: 'The 2013 airburst changed how we think about small asteroid threats — and how cities prepare.',
    text: 'On 15 February 2013 a 20-metre asteroid entered over Chelyabinsk at 19 km/s and exploded 30 km up, releasing roughly 500 kilotonnes of energy. The blast damaged 7,000 buildings and injured 1,600 people, mostly from flying glass. The event showed that airbursts, not craters, are the most likely damage mechanism for small impactors, and it accelerated work on warning systems such as ATLAS and the NEO Surveyor telescope.' },
  { id: 'n3', cat: 'Constellations', title: 'Orion’s shoulder is dimming', body: '',
    teaser: 'Betelgeuse is entering a new dimming phase — a preview of the supernova it will eventually become.',
    text: 'Betelgeuse, the red supergiant marking Orion’s shoulder, has begun another episode of fading. The star dimmed dramatically in 2019–20 when ejected dust obscured it, and it is now showing a similar photometric dip. Betelgeuse is expected to explode as a supernova within the next 100,000 years, briefly outshining the full Moon in Earth’s sky.' },
  { id: 'n4', cat: 'Moons', title: 'Europa Clipper settles into cruise', body: 'europa',
    teaser: 'The spacecraft is using gravity assists to reach Jupiter, where it will assess Europa’s habitability.',
    text: 'NASA’s Europa Clipper, launched in October 2024, is in the cruise phase of a 2.9-billion-km journey. It will perform a Mars gravity assist and then an Earth flyby before entering Jupiter orbit in 2030. Its nine instruments will probe the ice shell and the ocean beneath, measuring salinity, ice thickness and plume chemistry across dozens of close passes.' },
  { id: 'n5', cat: 'Solar System', title: 'Pluto’s atmosphere is collapsing', body: 'pluto',
    teaser: 'With Pluto moving away from the Sun, its thin nitrogen atmosphere may be freezing back onto the surface.',
    text: 'Stellar occultations observed in 2024 and 2025 show Pluto’s atmospheric pressure is falling. Because Pluto’s orbit is so eccentric, its atmosphere sublimes near perihelion and can freeze out at aphelion. Models predict the atmosphere could largely disappear by the 2030s, making Pluto an airless world for most of its 248-year orbit.' },
  { id: 'n6', cat: 'Impacts', title: 'Webb confirms a Kuiper Belt collision', body: 'kuiper-belt',
    teaser: 'A fresh dust cloud in the outer solar system points to a recent collision between icy bodies.',
    text: 'JWST spectroscopy has identified a cloud of unusually fine crystalline water-ice dust around a distant Kuiper Belt object. The grain size distribution matches debris from a high-speed collision between two bodies a few kilometres across, offering a direct look at how planetesimals grow and shatter in the outer solar system.' },
  { id: 'n7', cat: 'Constellations', title: 'A new meteor shower from a broken comet', body: 'neowise',
    teaser: 'Debris from Comet NEOWISE may produce a fresh shower visible from the northern hemisphere.',
    text: 'Dust trails released by Comet NEOWISE during its 2020 perihelion are drifting into Earth’s path. Models predict a modest shower with a radiant near Ursa Major, peaking in the pre-dawn hours. Observers should look for slow, bright meteors with persistent trains, far from city lights.' },
  { id: 'n8', cat: 'Planets', title: 'Saturn’s rings are younger than thought', body: 'saturn',
    teaser: 'Cassini data suggest the rings may be only a few hundred million years old — and slowly disappearing.',
    text: 'Analysis of ring-particle dynamics and micrometeoroid flux measured by Cassini indicates Saturn’s rings are losing mass at a rate that would empty them in a few hundred million years. The rings may be the shattered remains of a moon destroyed relatively recently, making the current ring system a transient spectacle in the age of astronomy.' },
  { id: 'n9', cat: 'Solar System', title: 'The Sun’s magnetic poles are flipping', body: 'sun',
    teaser: 'The solar cycle is nearing its maximum, bringing auroras to lower latitudes and a reversed field.',
    text: 'As the Sun approaches solar maximum, its global magnetic field is reversing polarity, a process that happens every 11 years. Sunspot numbers are climbing and coronal mass ejections are becoming more frequent, lighting up auroras far from the poles and posing occasional risks to satellites and power grids.' },
  { id: 'n10', cat: 'Moons', title: 'Enceladus’s ocean is rich in organics', body: 'enceladus',
    teaser: 'Plume samples reveal a complex organic chemistry beneath the moon’s icy shell.',
    text: 'Cassini’s plunge through Enceladus’s south-polar plumes found molecular hydrogen, methane, and a range of organic compounds. Laboratory experiments now suggest hydrothermal reactions at the seafloor could sustain chemical energy gradients — a promising environment for life, and a strong argument for a future lander.' },
  { id: 'n11', cat: 'Impacts', title: 'DART’s debris is still spreading', body: 'asteroid-belt',
    teaser: 'The aftermath of the 2022 asteroid deflection is teaching us how momentum moves through rubble piles.',
    text: 'The DART impact on Dimorphos shortened its orbit by 32 minutes, far more than the momentum of the impactor alone would explain. Ejecta carried away additional momentum, a phenomenon called the beta effect. Hubble and ground telescopes continue to track the expanding debris trail, informing the design of future planetary-defence missions.' },
  { id: 'n12', cat: 'Constellations', title: 'Pleiades: a cluster in motion', body: '',
    teaser: 'Gaia data reveal the Seven Sisters are being pulled apart by the Milky Way’s tides.',
    text: 'The Pleiades star cluster is only about 100 million years old, but its stars are already dispersing. Gaia’s precise proper motions show tidal tails trailing and leading the cluster, giving astronomers a nearby laboratory for how open clusters dissolve into the galactic field.' },
  { id: 'n13', cat: 'Planets', title: 'Venus’s clouds may host habitable droplets', body: 'venus',
    teaser: 'A new lab study finds that sulfuric-acid cloud droplets could support complex chemistry.',
    text: 'Researchers have shown that concentrated sulfuric-acid aerosols at Venus’s cloud-deck temperatures can host stable organic species in a way that challenges the assumption the clouds are sterile. The result is not evidence of life, but it keeps the cloud layer on the shortlist of solar-system environments worth exploring with balloons or drones.' },
  { id: 'n14', cat: 'Moons', title: 'Titan’s lakes are changing with the seasons', body: 'titan',
    teaser: 'Cassini and ground-based radar show methane lake levels shifting as Titan’s northern summer ends.',
    text: 'Long-term radar monitoring of Titan’s polar lakes shows they are evaporating and re-condensing as the moon moves through its 29.5-year seasons. The measurements constrain the methane cycle and help plan the Dragonfly rotorcraft mission, which will land near the Selk crater in the 2030s.' },
  { id: 'n15', cat: 'Solar System', title: 'A comet from another star', body: 'oort-cloud',
    teaser: 'Interstellar visitors like 2I/Borisov offer a rare comparison sample from beyond the Sun.',
    text: '2I/Borisov, discovered in 2019, was only the second confirmed interstellar object. Its carbon-monoxide-rich coma differs sharply from solar-system comets, suggesting it formed in a colder, more distant protoplanetary disc. Upcoming survey telescopes should find many more, turning asteroseismology of comets into a regular field.' },
  { id: 'n16', cat: 'Impacts', title: 'The Tunguska blast, re-measured', body: 'chelyabinsk',
    teaser: 'Tree-ring and sediment records refine the size of the 1908 airburst.',
    text: 'A new analysis of tree rings and lake sediments from the Tunguska region estimates the 1908 explosion at 10–15 megatonnes, flattening 2,000 km² of forest. The study also finds a modest increase in atmospheric dust that persisted for months, helping calibrate how a future airburst would alter the upper atmosphere.' },
  { id: 'n17', cat: 'Planets', title: 'Mars’s dust storms have a rhythm', body: 'mars',
    teaser: 'Orbital data reveal a three-year pattern in global dust activity.',
    text: 'Combining two decades of Mars orbiter observations, scientists have identified a repeating pattern in the timing of regional dust storms. The finding could improve forecasts for future surface missions, since dust storms can starve solar-powered landers of light for weeks.' },
  { id: 'n18', cat: 'Constellations', title: 'How to find the Andromeda Galaxy', body: '',
    teaser: 'A guide to spotting the most distant object visible to the naked eye.',
    text: 'From a dark site, the Andromeda Galaxy appears as a faint elongated smudge near the constellation Andromeda, roughly 2.5 million light-years away. Find Cassiopeia’s W, then follow its right-hand V toward Mirach and hop one star further. Binoculars reveal its bright core and the companion galaxies M32 and M110.' },
  { id: 'n19', cat: 'Moons', title: 'Io’s volcanoes shift with Jupiter’s tides', body: 'io',
    teaser: 'Decades of observations show the moon’s volcanic heat pulsing in step with its orbit.',
    text: 'Io is squeezed by Jupiter’s gravity on a 42-hour orbital cycle, and infrared monitoring now shows its volcanic output varying with that rhythm. The data help constrain how tidal heating powers the moon’s magma ocean and how material is exchanged between Io and Jupiter’s magnetosphere.' },
  { id: 'n20', cat: 'Solar System', title: 'Voyager 1 beyond the heliopause', body: 'oort-cloud',
    teaser: 'The most distant human-made object keeps returning data from the interstellar medium.',
    text: 'More than 24 billion km from Earth, Voyager 1 continues to measure plasma density and magnetic fields in interstellar space. Its instruments are being powered down one by one, but the spacecraft may keep transmitting into the 2030s — a message in a bottle from the edge of the Sun’s domain.' },
  { id: 'n21', cat: 'Planets', title: 'Neptune’s winds are cooling', body: 'neptune',
    teaser: 'Thermal maps show Neptune’s stratosphere has cooled and its cloud cover has faded.',
    text: 'Infrared observations from VLT and Spitzer show Neptune’s stratospheric temperatures dropped by about 8 °C between 2003 and 2018, while its bright cloud bands nearly disappeared. The changes may be linked to the solar cycle and to seasonal forcing in the ice giant’s atmosphere.' },
  { id: 'n22', cat: 'Constellations', title: 'The Southern Cross and the Coal Sack', body: '',
    teaser: 'Crux points the way to the southern pole — and hides a dark nebula in plain sight.',
    text: 'The compact constellation Crux is the Southern Hemisphere’s signpost: its long axis points toward the south celestial pole. Beside it lies the Coalsack, a dark nebula of cold dust that blocks the Milky Way’s light — one of the most obvious naked-eye dark nebulae in the sky.' },
  { id: 'n23', cat: 'Impacts', title: 'A near-miss asteroid and what we learned', body: 'asteroid-belt',
    teaser: 'A 50-metre object passed inside the Moon’s orbit, giving radar astronomers a detailed look.',
    text: 'A recently discovered asteroid about 50 m across passed within 0.3 lunar distances, close enough for Goldstone radar to resolve its shape. The object is a contact binary — two lobes touching — a common architecture that affects how such bodies would respond to a deflection attempt.' },
  { id: 'n24', cat: 'Planets', title: 'Jupiter’s Great Red Spot is shrinking', body: 'jupiter',
    teaser: 'The centuries-old storm is now barely wider than Earth — and getting rounder.',
    text: 'Long-term measurements show the Great Red Spot has contracted from 40,000 km across in the 1800s to about 14,000 km today. Its winds remain fierce, but the storm’s aspect ratio is changing. Juno’s close passes are probing the vortex’s depth to understand why it is shrinking.' }
];

/* ----------------------------------------------------------------------- */
/*  Lookup helpers                                                         */
/* ----------------------------------------------------------------------- */

export const BODIES = [
  ...MAJOR,
  ...MOONS,
  ...BELTS,
  ...COMETS,
  ...METEORITES
];

export const BY_ID = Object.fromEntries(BODIES.map(b => [b.id, b]));

export const CATEGORIES = [
  { key: 'star', label: 'Stars', icon: '★' },
  { key: 'planet', label: 'Planets', icon: '◉' },
  { key: 'dwarf', label: 'Dwarf Planets', icon: '◍' },
  { key: 'moon', label: 'Moons', icon: '☾' },
  { key: 'belt', label: 'Asteroids', icon: '⁘' },
  { key: 'comet', label: 'Comets', icon: '☄' },
  { key: 'meteoroid', label: 'Meteoroids', icon: '✦' }
];

export function childrenOf(id) {
  if (id === 'sun') return BY_ID['sun'] ? [] : [];
  return BODIES.filter(b => b.parent === id);
}

export function yearLabel(days) {
  if (!days) return '—';
  if (days < 400) return `${days.toFixed(1)} Earth days`;
  const y = days / 365.256;
  if (y < 1000) return `${y.toFixed(1)} Earth years`;
  return `${Math.round(y).toLocaleString()} Earth years`;
}

export function fmtRadius(km) {
  if (!km) return '—';
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
}
