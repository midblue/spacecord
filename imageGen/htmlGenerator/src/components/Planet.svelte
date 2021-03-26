<script>
  import Point from './Point.svelte'

  import { winSizeMultiplier as winSizeMultiplierStore } from '../js/stores.js'
  let winSizeMultiplier
  winSizeMultiplierStore.subscribe((value) => (winSizeMultiplier = value))

  import { popOver as popOverStore } from '../js/stores.js'

  export let location,
    minSize = 0.015,
    radius,
    color,
    name,
    z = 2

  let hovering = false
  const earthRadiusInAU = 6371 / 149597900
  let minSizeAdjustedForActualSize = 0
  $: minSizeAdjustedForActualSize =
    (((radius - earthRadiusInAU) / earthRadiusInAU) * 0.5 + 1) *
    minSize *
    winSizeMultiplier

  function enter() {
    hovering = true
    popOverStore.set({ type: 'planet', name, location })
  }

  function leave() {
    hovering = false
    popOverStore.set()
  }
</script>

<defs>
  <radialGradient id={name}>
    <stop offset="30%" stop-color={color} />
    <stop offset="100%" stop-color="transparent" />
  </radialGradient>
</defs>

<g class={'atmosphere' + (hovering ? ' hovering' : '')}>
  <Point
    {location}
    minSize={minSizeAdjustedForActualSize * 4}
    radius={radius * 4}
    color={`url('#${name}')`}
    z={1}
  />
</g>

<Point
  {location}
  minSize={minSizeAdjustedForActualSize}
  {radius}
  {color}
  {name}
  {z}
  multiplyScale={false}
  on:enter={enter}
  on:leave={leave}
/>

<style>
  .atmosphere {
    pointer-events: none;
    opacity: 0.2;
  }
  .atmosphere.hovering {
    opacity: 0.3;
  }
</style>
