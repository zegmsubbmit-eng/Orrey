# ORRERY — a solar system atlas & expedition game

A self-contained browser game. Open `index.html` (it is the entry point) and sign in with the
Google-style account chooser to begin.

## What is in the box

- **92 catalogued bodies** — 1 star, 8 planets, 9 dwarf planets, 59 moons, 3 debris regions
  (asteroid belt, Kuiper belt, Oort cloud), 6 comets and 6 meteorites — organised in a
  collapsible hierarchy exactly by class.
- **Three scale modes**
  - *Cinematic* — orbits keep their true shape and eccentricity, gaps and body sizes are
    compressed so everything is visible.
  - *True distances* — 1 AU = 40 scene units, so orbital spacing is 1:1; sizes are enlarged
    so worlds can still be seen.
  - *True 1:1* — sizes and distances are both real. The Sun is 109 Earth radii and Neptune is
    30 AU away, exactly as it is.
- **Procedurally generated worlds plus real imagery** — Earth, Mercury, Venus, Mars, Jupiter,
  Saturn, Uranus, Neptune, the Moon and Pluto use NASA / Solar System Scope albedo maps;
  every moon, icy body, comet and meteorite gets a locally generated map built from its real
  palette and surface character, so the game still works offline.
- **Landings** — descend to any solid body and walk its surface (drag to look, WASD / arrows,
  scroll to zoom), collect samples, and return to orbit. Gas giants have a cloud-deck descent;
  the Sun has a shielded photosphere flyby.
- **Weekly dispatch** — six detailed stories per edition, drawn from a 24-article survey
  covering the solar system, constellations, impact events and missions. The edition number,
  lead story and countdown to next Monday 00:00 UTC are computed from the real calendar, so the
  newsroom really does change every week.
- **Save game** — profile, visited worlds, landings, samples, simulated date and scale
  settings are stored in `localStorage`; *Continue Expedition* restores them.

## Controls

| Action | Input |
| --- | --- |
| Orbit camera | drag / one-finger drag |
| Zoom | scroll / pinch |
| Inspect a body | click it, or click its catalog entry |
| Travel | *Travel here*, or click a catalog entry |
| Land | *Land* in the info panel |
| Surface look | drag |
| Surface walk | W A S D or arrow keys (Shift to run) |
| Pause / play time | Space, or the ❚❚ button |
| Close panels | Esc |

## Notes

- Planet textures: Solar System Scope (CC BY 4.0). Pluto global colour mosaic: NASA/JHUAPL/SwRI
  (public domain). All other surface maps are generated in-browser.
- Physical data (radii, orbits, temperatures, atmospheres) follows published NASA/IAU values;
  small-body moon data is rounded.
- Everything runs locally: no server, no tracking, no external API keys.
