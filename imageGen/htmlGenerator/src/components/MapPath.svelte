<script>
  import MapPoint from './MapPoint.svelte'

  export let pathPoints = []
  export let upperBound = 0
  export let leftBound = 0
  export let bufferDistance = 0
  export let displayDiameter = 0
  export let colorRgb = '255,255,255'
  export let fade = true

  let pointsToShow = [
    ...pathPoints.map((l, index) => ({
      location: l.location ? l.location : l,
      size: 2,
      color: `rgba(${colorRgb},${
        fade ? (0.1 * index) / pathPoints.length : 0.15
      })`,
    })),
  ]

  pointsToShow = pointsToShow.map((p) => {
    return {
      ...p,
      topPercent:
        ((upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter) *
        100,
      leftPercent:
        ((p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter) *
        100,
    }
  })
</script>

{#each pointsToShow as p}
  <MapPoint {...p} />
{/each}

<style>
</style>
