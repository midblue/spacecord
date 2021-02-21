<script>
  export let topPercent
  export let leftPercent
  export let radiusPercent
  export let label;
  export let color = 'var(--ui)'
  export let opacity = 0.2
  export let strokeWidth = 2

  console.log({topPercent, leftPercent, radiusPercent})
</script>

<div class="circleholder" style="--accent-color: {color}; --diameter: {radiusPercent * 2}%; --stroke: {strokeWidth}px; --opacity:{opacity}; left: {leftPercent}%; top: {topPercent}%;">
  {#if label}
    <div class="label minilabel" style="">{label}</div>
    <div class="label minilabel top" style="">{label}</div>
  {/if}
  <div class="circle" style="opacity: {opacity};"></div>
</div>

<style>
  .circleholder {
    position: absolute;
    width: var(--diameter);
    height: var(--diameter);
    transform: translate(-50%, -50%)
  }
  .label {
    position: absolute;
    left: 50%;
    bottom: -.5em;
    transform: translateX(-50%);
    color: var(--accent-color);
    opacity: 1;
    opacity: calc(var(--opacity) * 2);
  }
  .label.top {
    bottom: auto;
    top: -.5em;
  }
  .circle {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    border: var(--stroke) solid var(--accent-color);
    position: absolute;
  }
</style>