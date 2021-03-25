<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => (scale = value))

  import { winSizeMultiplier as winSizeMultiplierStore } from '../js/stores.js'
  let winSizeMultiplier
  winSizeMultiplierStore.subscribe((value) => (winSizeMultiplier = value))

  const FLAT_SCALE = 100

  export let points = []
  export let colorRgb = '255,255,255'
  export let stroke
  export let fade = true
  export let z = 1
  export let strokeWidth = 0.003

  let lines = []
  $: {
    lines = [
      ...points.map((l, index) => ({
        location: l,
        color: stroke
          ? ''
          : `rgba(${colorRgb}, ${fade ? 0.5 * (index / points.length) : 1})`,
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
    lines.shift()
  }
</script>

<g
  class="path"
  style="z-index: {z}"
  on:mouseenter={() => dispatch('enter')}
  on:mouseleave={() => dispatch('leave')}
>
  {#each lines as line}
    <line
      x1={line.from[0] * FLAT_SCALE}
      y1={line.from[1] * FLAT_SCALE}
      x2={line.to[0] * FLAT_SCALE}
      y2={line.to[1] * FLAT_SCALE}
      stroke={line.color || stroke}
      stroke-width={(strokeWidth * FLAT_SCALE * winSizeMultiplier) / scale}
    />
  {/each}
</g>

<style>
  g {
    position: relative;
  }
</style>
