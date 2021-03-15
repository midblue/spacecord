<script>
  import MapCircle from './MapCircle.svelte'

  export let centerPoint
  export let displayDiameter

  let auBetweenLines = 1
  while (auBetweenLines / displayDiameter < 0.15) auBetweenLines *= 2

  const circlesToShow = []
  for (let i = 1; i < 7; i++) {
    circlesToShow.push({
      topPercent: centerPoint.topPercent,
      leftPercent: centerPoint.leftPercent,
      radiusPercent: (auBetweenLines / displayDiameter) * i * 100,
      label: auBetweenLines * i + 'AU',
    })
  }
</script>

{#each circlesToShow as c}
  <MapCircle {...c} />
{/each}

<style>
</style>
