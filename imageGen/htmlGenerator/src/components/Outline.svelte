<script>
  import { scale as scaleStore, view as viewStore } from '../js/stores.js'
  let view
  viewStore.subscribe((value) => (view = value))
  let scale
  scaleStore.subscribe((value) => (scale = value))

  import { winSizeMultiplier as winSizeMultiplierStore } from '../js/stores.js'
  let winSizeMultiplier
  winSizeMultiplierStore.subscribe((value) => (winSizeMultiplier = value))

  const FLAT_SCALE = 100

  export let location,
    radius,
    color,
    label,
    blackout,
    opacity = 0.3,
    dash = false
</script>

<g class="outline" style={blackout ? 'opacity: 1;' : `opacity: ${opacity};`}>
  <circle
    cx={location[0] * FLAT_SCALE}
    cy={location[1] * FLAT_SCALE}
    r={radius}
    stroke={color || 'white'}
    stroke-width={((blackout ? 0.002 : 0.0025) *
      FLAT_SCALE *
      winSizeMultiplier) /
      scale}
    stroke-dasharray={dash ? dash + ' ' + dash : ''}
    fill="none"
  />
  {#if label}
    <text
      x={location[0] * FLAT_SCALE}
      y={location[1] * FLAT_SCALE + radius * -1 - view.height * 0.005}
      text-anchor="middle"
      font-size={(0.02 * FLAT_SCALE * winSizeMultiplier) / scale}
      fill={color || 'white'}
    >
      {label}
    </text>
  {/if}
</g>

<style>
  circle {
    opacity: 0.6;
  }
  text {
    text-transform: uppercase;
    font-weight: bold;
  }
</style>
