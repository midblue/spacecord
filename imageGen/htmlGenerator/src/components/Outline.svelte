<script>
  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => (scale = value))

  const FLAT_SCALE = 100

  export let location, radius, color, label
</script>

<circle
  cx={location[0] * FLAT_SCALE}
  cy={location[1] * FLAT_SCALE}
  r={radius}
  stroke={color || 'white'}
  stroke-width={(0.001 * FLAT_SCALE) / scale}
  fill="none"
/>
{#if label}
  <text
    x={location[0] * FLAT_SCALE}
    y={location[1] * FLAT_SCALE + radius * FLAT_SCALE * -1}
    text-anchor="middle"
    font-size={(0.165 * FLAT_SCALE) / scale + '%'}
    fill={color || 'white'}
  >
    {label}
  </text>{/if}

<style>
  circle {
    opacity: 0.3;
  }
  text {
    text-transform: uppercase;
    font-weight: bold;
    opacity: 0.35;
  }
</style>
