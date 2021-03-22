<script>
  import MapCircle from './MapCircle.svelte'

  export let centerPoint
  export let diameter

  let auBetweenLines = 1 / 16384
  while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2

  console.log(auBetweenLines, centerPoint, diameter)

  const circlesToShow = []
  for (let i = 1; i < 7; i++) {
    circlesToShow.push({
      topPercent: centerPoint.topPercent,
      leftPercent: centerPoint.leftPercent,
      radiusPercent: (auBetweenLines / diameter) * i,
      label: Math.round(auBetweenLines * i * 10000) / 10000 + 'AU',
      opacity: 0.25,
      strokeWidth: 1,
    })
  }
</script>

{#each circlesToShow as c}
  <MapCircle {...c} />
{/each}

<style>
</style>
