<script>
  import MapPoint from './MapPoint.svelte'

  export let topPercent
  export let leftPercent
  export let label
  export let color = 'green'
  export let size = 6
  export let round = true

  let sizeToUse = Math.min(100000, Math.max(3, size))
</script>

<MapPoint {topPercent} {leftPercent} {label} {color} size={sizeToUse} {round} />
