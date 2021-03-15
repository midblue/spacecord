<script>
  import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapPath from './components/MapPath.svelte'
  import MapDistanceCircles from './components/MapDistanceCircles.svelte'

  export let ship
  export let planets

  const edgeBuffer = 0.3

  let pathPoints = [
    ...ship.pastLocations.map((l) => ({
      location: l,
    })),
  ]
  let entityPoints = [
    ...planets.map((p) => ({
      name: p.name,
      location: p.location,
      color: p.validColor || p.color,
    })),
    {
      name: ship.name + '\n(you)',
      location: ship.location,
      color: 'white',
    },
  ]

  let upperBound = pathPoints.reduce(
    (max, p) => Math.max(p.location[1], max),
    -999999999999,
  )
  let rightBound = pathPoints.reduce(
    (max, p) => Math.max(p.location[0], max),
    -999999999999,
  )
  let lowerBound = pathPoints.reduce(
    (min, p) => Math.min(p.location[1], min),
    999999999999,
  )
  let leftBound = pathPoints.reduce(
    (min, p) => Math.min(p.location[0], min),
    999999999999,
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
  const bufferDistance = diameter * edgeBuffer
  const displayDiameter = diameter + bufferDistance

  pathPoints = pathPoints.map((p) => ({
    ...p,
    label: p.name,
    topPercent:
      ((upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter) *
      100,
    leftPercent:
      ((p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter) *
      100,
  }))

  entityPoints = entityPoints.map((p) => ({
    ...p,
    label: p.name,
    topPercent:
      ((upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter) *
      100,
    leftPercent:
      ((p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter) *
      100,
  }))

  const shipPoint = entityPoints[entityPoints.length - 1]
</script>

<!-- <Starfield /> -->
<div style="--ui: #ccc; --bg: #222;">
  <Box label={'Recent Ship Path'}>
    <MapDistanceCircles centerPoint={shipPoint} {displayDiameter} />
    <MapPath
      {pathPoints}
      {upperBound}
      {leftBound}
      {bufferDistance}
      {displayDiameter}
    />
    {#each entityPoints as p}
      <MapPoint {...p} />
    {/each}
  </Box>
</div>

<style>
</style>
