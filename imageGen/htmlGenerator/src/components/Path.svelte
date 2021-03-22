<script>
  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => (scale = value))

  const FLAT_SCALE = 100

  export let points = []
  export let colorRgb = '255,255,255'
  export let fade = true
  export let z = 1

  let lines = []
  $: {
    lines = [
      ...points.map((l, index) => ({
        location: l,
        color: `rgba(${colorRgb}, ${
          fade ? 0.7 * (index / points.length) : 0.15
        })`,
      })),
    ]

    let from
    for (let l of lines) {
      const to = l.location
      if (!from) from = to
      l.from = from
      l.to = to
      from = to
    }
  }
</script>

<g class="path" style="z-index: {z}">
  {#each lines as line}
    <line
      x1={line.from[0] * FLAT_SCALE}
      y1={line.from[1] * FLAT_SCALE}
      x2={line.to[0] * FLAT_SCALE}
      y2={line.to[1] * FLAT_SCALE}
      stroke={line.color}
      stroke-width={(0.003 * FLAT_SCALE) / scale}
    />
  {/each}
</g>

<style>
</style>
