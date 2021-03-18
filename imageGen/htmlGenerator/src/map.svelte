<script>
  const KM_PER_AU = 149597900

  import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapPlanet from './components/MapPlanet.svelte'
  import MapDistanceCircles from './components/MapDistanceCircles.svelte'
  import Starfield from './components/Starfield.svelte'

  export let ship
  export let planets

  const edgeBuffer = 0.7

  let pointsToShow = [
    ...planets.map((p) => ({
      name: p.name,
      location: p.location,
      color: p.validColor || p.color,
      radius: p.radius,
    })),
    { name: ship.name + '\n(you)', location: ship.location, color: 'white' },
  ]

  let upperBound = pointsToShow.reduce(
    (max, p) => Math.max(p.location[1], max),
    -99999999,
  )
  let rightBound = pointsToShow.reduce(
    (max, p) => Math.max(p.location[0], max),
    -99999999,
  )
  let lowerBound = pointsToShow.reduce(
    (min, p) => Math.min(p.location[1], min),
    99999999,
  )
  let leftBound = pointsToShow.reduce(
    (min, p) => Math.min(p.location[0], min),
    99999999,
  )

  const heightDiff = Math.abs(upperBound - lowerBound)
  const widthDiff = Math.abs(rightBound - leftBound)

  const diameter = Math.max(heightDiff, widthDiff)
  if (heightDiff !== diameter) {
    upperBound += (diameter - heightDiff) / 2
    lowerBound -= (diameter - heightDiff) / 2
  }
  if (widthDiff !== diameter) {
    rightBound += (diameter - widthDiff) / 2
    leftBound -= (diameter - widthDiff) / 2
  }
  const bufferDistance = diameter * edgeBuffer + 0.001
  const displayDiameter = diameter + bufferDistance

  const pixelsPerKilometer = 600 / displayDiameter / KM_PER_AU

  pointsToShow.forEach((p) => {
    if (p.radius) p.size = Math.max(4, p.radius * 2 * pixelsPerKilometer)
  })

  let auBetweenLines = 1
  while (auBetweenLines / displayDiameter < 0.15) auBetweenLines *= 2

  pointsToShow = pointsToShow.map((p) => {
    console.log(
      'tp',
      (upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter,
      leftBound,
      (p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter,
    )

    return {
      ...p,
      label: p.name,
      topPercent:
        ((upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter) *
        100,
      leftPercent:
        ((p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter) *
        100,
    }
  })

  const shipPoint = pointsToShow[pointsToShow.length - 1]
</script>

<!-- <Starfield /> -->
<Box label={'Discovered Planets'}>
  <MapDistanceCircles centerPoint={shipPoint} diameter={displayDiameter} />
  {#each pointsToShow.filter((p) => p.radius) as p}
    <MapPlanet {...p} />
  {/each}
  <MapPoint {...shipPoint} />
</Box>

<style>
</style>
