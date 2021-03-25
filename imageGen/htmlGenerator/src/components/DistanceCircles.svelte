<script>
  import Outline from './Outline.svelte'

  export let width, height, location

  const FLAT_SCALE = 100
  let circlesToDraw = []

  $: if (width) {
    let auBetweenLines = 1 / 2 ** 8
    const diameter = Math.max(width, height)
    while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2

    circlesToDraw = []
    for (let i = 1; i < 10; i++) circlesToDraw.push(auBetweenLines * i)
  }
</script>

<g class="distancecircles">
  {#each circlesToDraw as radius}
    <Outline
      {location}
      {radius}
      color="#bbb"
      label={radius / FLAT_SCALE + ' AU'}
    />
  {/each}
</g>

<style>
</style>
