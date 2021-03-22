<script>
  const KM_PER_AU = 149597900

  import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapDistanceCircles from './components/MapDistanceCircles.svelte'
  import MapCircle from './components/MapCircle.svelte'
  import Starfield from './components/Starfield.svelte'

  const {
    ship,
    attackRadius,
    interactRadius,
    scanRadius,
    planets,
    ships,
    caches,
    range,
  } = APP_DATA
  const repair = APP_DATA.repair || 1

  const allColors = ['white', 'green', 'yellow', 'red', 'purple']
  const getColor = (c) =>
    Math.random() < repair
      ? c
      : allColors[Math.floor(Math.random() * allColors.length)]
  const getSize = (s) =>
    Math.random() < repair ? s : s + (Math.random() - 0.5) * (1 - repair) * 0.1
  const getRound = (r) => (Math.random() < repair ? r : Math.random() > 0.5)
  const getLocation = (coords) => {
    return coords.map((c) =>
      Math.random() < repair
        ? c
        : c + (Math.random() - 0.5) * (1 - repair) * range,
    )
  }

  let pointsToShow = [
    ...planets.map((p) => ({
      color: getColor('green'),
      location: getLocation(p.location),
      radius: p.radius,
      round: getRound(true),
      name: p.name,
    })),
    ...caches.map((c) => ({
      color: getColor('yellow'),
      location: getLocation(c.location),
      size: getSize(0.01),
      round: getRound(false),
    })),
    ...ships.map((s) => ({
      color: getColor('red'),
      location: getLocation(s.location),
      size: getSize(0.01),
      round: getRound(false),
      name: s.name,
    })),
    {
      location: getLocation(ship.location),
      color: getColor('white'),
      size: getSize(0.01),
      round: getRound(false),
    },
  ]

  const center = pointsToShow[pointsToShow.length - 1].location
  let upperBound = center[1] + range
  let leftBound = center[0] - range

  const diameter = range * 2

  let auBetweenLines = 1
  while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2

  const percentPerKilometer = 1 / diameter / KM_PER_AU

  pointsToShow.forEach((p) => {
    if (p.radius)
      p.size = getSize(Math.max(0.013, p.radius * 2 * percentPerKilometer))
  })
  // console.log(pointsToShow)

  pointsToShow = pointsToShow.map((p) => {
    return {
      ...p,
      label: p.name,
      topPercent: ((upperBound - p.location[1]) / diameter) * 100,
      leftPercent: ((p.location[0] - leftBound) / diameter) * 100,
    }
  })

  const shipPoint = pointsToShow[pointsToShow.length - 1]

  const blackoutCircle = {
    topPercent: shipPoint.topPercent,
    leftPercent: shipPoint.leftPercent,
    radiusPercent: range / diameter,
    blackout: true,
  }

  const circlesToShow = []
  if (attackRadius)
    circlesToShow.push({
      topPercent: shipPoint.topPercent,
      leftPercent: shipPoint.leftPercent,
      radiusPercent: percentPerKilometer * attackRadius * KM_PER_AU,
      label: 'Attack',
      color: 'red',
    })
  if (interactRadius)
    circlesToShow.push({
      topPercent: shipPoint.topPercent,
      leftPercent: shipPoint.leftPercent,
      radiusPercent: percentPerKilometer * interactRadius * KM_PER_AU,
      label: 'Interact',
      color: 'white',
    })
  if (scanRadius)
    circlesToShow.push({
      topPercent: shipPoint.topPercent,
      leftPercent: shipPoint.leftPercent,
      radiusPercent: percentPerKilometer * scanRadius * KM_PER_AU,
      label: 'Ship Scan',
      color: 'cyan',
    })

  const rotateAmount =
    Math.random() < repair ? 0 : (Math.random() - 0.5) * (1 - repair) * 180
</script>

<!-- <Starfield /> -->
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
      {#each circlesToShow as c}
        <MapCircle {...c} />
      {/each}
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
