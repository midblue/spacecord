<script>
  export let topPercent
  export let leftPercent
  export let radiusPercent
  export let label
  export let blackout
  export let color = 'var(--ui)'
  export let opacity = 0.2
  export let strokeWidth = 2

  // console.log({topPercent, leftPercent, radiusPercent})
</script>

<div
  class="circleholder {blackout ? 'blackout' : ''}"
  style="--accent-color: {color}; --diameter: {radiusPercent *
    2 *
    100}%; --stroke: {strokeWidth}px; --opacity:{opacity}; left: {leftPercent}%; top: {topPercent}%;"
>
  {#if label}
    {#if radiusPercent > 0.1}
      <div class="label minilabel" style="">{label}</div>
    {/if}
    <div class="label minilabel top" style="">{label}</div>
  {/if}
  <div class="circle" style="opacity: {blackout ? 1 : opacity};" />
</div>

<style>
  .circleholder {
    position: absolute;
    width: var(--diameter);
    height: var(--diameter);
    transform: translate(-50%, -50%);
  }
  .label {
    position: absolute;
    left: 50%;
    bottom: -0.5em;
    transform: translateX(-50%);
    color: var(--accent-color);
    opacity: 1;
    opacity: calc(var(--opacity) * 1.5);
    font-size: var(--text-size-tiny);
  }
  .label.top {
    bottom: auto;
    top: -0.5em;
  }
  .circle {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    border: var(--stroke) solid var(--accent-color);
    position: absolute;
  }
  .blackout {
    z-index: 3;
  }
  .blackout .circle {
    border-width: 1px;
    box-shadow: 0 0 0 10000px var(--bg);
  }
</style>
