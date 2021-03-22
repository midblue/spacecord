<script>
  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => {
    scale = value
  })

  export let location,
    radius = 0,
    color,
    name
</script>

<g class="point">
  <circle
    cx={location[0]}
    cy={location[1]}
    r={Math.max(0.005 / scale, radius)}
    fill={color || 'white'}
  />
  {#if name && scale >= 0.9}
    <text
      x={location[0]}
      y={location[1] + Math.max(0.005 / scale, radius) * -2}
      text-anchor="middle"
      font-size={0.03 / scale}
      fill={color || 'white'}
    >
      {name}
    </text>
  {/if}
</g>

<style>
  text {
    text-transform: uppercase;
    font-weight: bold;
    opacity: 0.5;
  }
</style>
