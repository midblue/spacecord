<script>
  import Point from './Point.svelte'

  import { popOver as popOverStore } from '../js/stores.js'

  export let location,
    minSize = 0.01,
    radius,
    color,
    name,
    z = 2

  let hovering = false
  const earthRadiusInAU = 6371 / 149597900
  let minSizeAdjustedForActualSize =
    (((radius - earthRadiusInAU) / earthRadiusInAU) * 0.5 + 1) * minSize

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
    minSize={minSizeAdjustedForActualSize * 8}
    radius={radius * 8}
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
