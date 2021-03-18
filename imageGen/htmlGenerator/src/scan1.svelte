<script>
  import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapDistanceCircles from './components/MapDistanceCircles.svelte'
  import MapCircle from './components/MapCircle.svelte'
  import Starfield from './components/Starfield.svelte'

  export let ship
  export let planets
  export let ships
  export let caches
  export let range
  export let repair = 1

  const allColors = ['white', 'green', 'yellow', 'red', 'purple']
  const getColor = (c) =>
    Math.random() < repair
      ? c
      : allColors[Math.floor(Math.random() * allColors.length)]
  const getSize = (s) =>
    Math.random() < repair ? s : s + (Math.random() - 0.5) * (1 - repair) * 5
  const getRound = (r) => (Math.random() < repair ? r : Math.random() > 0.5)
  const getLocation = (coords) => {
    return coords.map((c) =>
      Math.random() < repair
        ? c
        : c + (Math.random() - 0.5) * (1 - repair) * range,
    )
  }

  let pointsToShow = [
    {
      location: getLocation(ship.location),
      color: getColor('white'),
      size: getSize(6),
      round: getRound(false),
    },
    ...planets.map((p) => ({
      color: getColor('green'),
      location: getLocation(p.location),
      radius: p.radius,
      round: getRound(true),
    })),
    ...caches.map((c) => ({
      color: getColor('yellow'),
      location: getLocation(c.location),
      size: getSize(6),
      round: getRound(false),
    })),
    ...ships.map((s) => ({
      color: getColor('red'),
      location: getLocation(s.location),
      size: getSize(6),
      round: getRound(false),
    })), //name: s.name,
  ]

  const center = pointsToShow[0].location
  let upperBound = center[1] + range
  let leftBound = center[0] - range

  const diameter = range * 2

  let auBetweenLines = 1
  while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2

  const pixelsPerKilometer = 600 / diameter / 1.496e8
  pointsToShow.forEach((p) => {
    if (p.radius)
      p.size = getSize(Math.max(4, p.radius * 2 * pixelsPerKilometer))
  })

  pointsToShow = pointsToShow.map((p) => {
    return {
      ...p,
      label: p.name,
      topPercent: ((upperBound - p.location[1]) / diameter) * 100,
      leftPercent: ((p.location[0] - leftBound) / diameter) * 100,
    }
  })

  const shipPoint = pointsToShow[0]

  const blackoutCircle = {
    topPercent: shipPoint.topPercent,
    leftPercent: shipPoint.leftPercent,
    radiusPercent: (range / diameter) * 100,
    blackout: true,
  }

  const rotateAmount =
    Math.random() < repair ? 0 : (Math.random() - 0.5) * (1 - repair) * 180
</script>

<Starfield />
<div style="--ui: #fd0; --bg: #210;">
  <Box
    label="Area Scan"
    label2={`[${Math.round((center[0] + range) * 1000) / 1000}, ${
      Math.round((center[1] - range) * 1000) / 1000
    }]`}
    label3={`[${Math.round((center[0] - range) * 1000) / 1000}, ${
      Math.round((center[1] + range) * 1000) / 1000
    }]`}
    label4={repair < 1 ? `Needs_Repair` : ''}
  >
    <div style="transform: rotate({rotateAmount}deg);">
      <MapDistanceCircles centerPoint={shipPoint} {diameter} />
      <MapCircle {...blackoutCircle} />
      {#each pointsToShow as p}
        <MapPoint {...p} />
      {/each}
    </div>
  </Box>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
