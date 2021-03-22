<script>
  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => (scale = value))

  export let location, radius, color, label
</script>

<circle
  cx={location[0]}
  cy={location[1]}
  r={radius}
  stroke={color || 'white'}
  stroke-width={0.001 / scale}
  fill="none"
/>
{#if label}
  <text
    x={location[0]}
    y={location[1] + radius * -1}
    text-anchor="middle"
    font-size={0.165 / scale + '%'}
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
